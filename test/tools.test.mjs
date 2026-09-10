// Tool contract test.
//
// The README promises one tool with a specific name and parameter set. The upstream list can
// change without a single commit here, and the README would start lying silently. These checks
// catch that before a user does.
//
// One live call serves two checks. Listing tools accepts any non-empty key, so a contract check
// that only lists tools stays green with a revoked or mistyped key. The same response also
// carries the numeric like count and the feed token the README leans on, so both are asserted
// against one call. That call costs 10 credits, which is the price of a canary that can fail
// for the right reason.
//
// Run: HASDATA_API_KEY=your_key_here npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';

const ENDPOINT = 'https://mcp.hasdata.com/api/mcp?apis=facebook';
const KEY = process.env.HASDATA_API_KEY;
const TIMEOUT_MS = 45_000;

const TOOL = 'hasdata_facebook_profile_getFacebookProfile';
const REQUIRED = ['handle'];
const PARAMS = ['language', 'nextPageToken'];
// Language codes the README names.
const LANGUAGES = ['en', 'de', 'pt', 'zh-hans'];

// A streamable HTTP body arrives either as plain JSON or as server-sent events. One SSE event
// can span several data: lines, several events can share one response, and a server is free to
// send progress notifications before the answer. So collect every event and pick the message
// carrying our request id instead of trusting the first data: line.
function parseRpc(raw, id) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed);

    const messages = [];
    for (const event of trimmed.split(/\r?\n\r?\n+/)) {
        const data = event
            .split(/\r?\n/)
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).replace(/^ /, ''))
            .join('\n');
        if (!data || data === '[DONE]') continue;
        try {
            messages.push(JSON.parse(data));
        } catch {
            // A keep-alive or a partial event is not our response.
        }
    }
    assert.ok(messages.length, `no JSON-RPC message in the response: ${raw.slice(0, 300)}`);
    const match = messages.find((m) => m.id === id);
    assert.ok(match, `no message with id ${id} in the response: ${raw.slice(0, 300)}`);
    return match;
}

let nextId = 1;

async function rpc(method, params = {}) {
    // The CI key sits on the free plan, where concurrency is 1. When several of
    // these repos are pushed at once their contract runs collide, and HasData
    // answers 429 with code concurrency_limit straight away rather than queueing.
    // That is a plan limit, not a broken contract, so the call is retried before
    // the test gives up. A 401 still fails on the first attempt.
    for (let attempt = 1; ; attempt++) {
        const id = nextId++;
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'x-api-key': KEY,
                'Content-Type': 'application/json',
                // The server answers over streamable HTTP, so accept both a plain body and a stream.
                Accept: 'application/json, text/event-stream',
            },
            body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        assert.equal(res.status, 200, `${method} returned ${res.status}`);
        const raw = await res.text();
        if (raw.includes('concurrency_limit') && attempt < 5) {
            await new Promise((r) => setTimeout(r, attempt * 4000));
            continue;
        }
        return { raw, body: parseRpc(raw, id) };
    }
}

// One network round trip for every test that needs the list.
let toolsPromise;
function listTools() {
    toolsPromise ??= rpc('tools/list').then(({ body }) => {
        assert.ok(body.result?.tools, 'the response carried no result.tools');
        return body.result.tools;
    });
    return toolsPromise;
}

// One paid round trip, shared by the checks that need a real answer.
let profilePromise;
function liveProfile() {
    profilePromise ??= rpc('tools/call', { name: TOOL, arguments: { handle: 'nike' } });
    return profilePromise;
}

const live = { skip: KEY ? false : 'HASDATA_API_KEY is not set, skipping the live checks' };

test('apis=facebook exposes the documented tool and nothing else', live, async () => {
    const tools = await listTools();
    const names = tools.map((t) => t.name).sort().join(', ');
    assert.equal(tools.length, 1, `expected 1 tool, got ${tools.length}: ${names}`);
    assert.equal(tools[0].name, TOOL, `the tool is now called ${tools[0].name}`);
});

test('the tool still requires a handle and carries a description', live, async () => {
    const [tool] = await listTools();
    const required = tool.inputSchema?.required ?? [];
    for (const param of REQUIRED) {
        assert.ok(required.includes(param), `${TOOL} should require ${param}, declares: ${required.join(', ') || 'nothing'}`);
    }
    assert.ok((tool.description || '').trim().length > 20, `${TOOL} has an empty or near-empty description`);
});

test('the parameters and language codes the README documents are still in the schema', live, async () => {
    const [tool] = await listTools();
    const props = tool.inputSchema?.properties ?? {};
    for (const param of PARAMS) {
        assert.ok(props[param], `${TOOL} no longer accepts ${param}`);
    }
    const offered = props.language?.enum ?? [];
    for (const code of LANGUAGES) {
        assert.ok(offered.includes(code), `language no longer accepts ${code}, offers: ${offered.join(', ') || 'no enum'}`);
    }
});

test('the key is accepted by HasData', live, async () => {
    const { raw } = await liveProfile();
    assert.ok(!raw.includes('401 Unauthorized'), 'HasData rejected the key');
    assert.ok(!raw.includes('"isError":true'), `the tool call failed: ${raw.slice(0, 300)}`);
});

// The README tells readers to compare on likesCount because it is a number, and to walk the
// feed with pagination.nextPageToken. Both claims are about the live response shape, and a
// parser change that broke either would leave a green tools list behind it.
test('a live page still returns a numeric like count and a feed token', live, async () => {
    const { body } = await liveProfile();
    const text = body.result?.content?.[0]?.text ?? '';
    const payload = JSON.parse(text);
    const json = payload.json;

    assert.ok(json?.profile, `no profile object in the response: ${text.slice(0, 300)}`);
    assert.equal(typeof json.profile.likesCount, 'number', `likesCount is no longer a number: ${JSON.stringify(json.profile.likesCount)}`);
    assert.ok(json.profile.name, 'the profile carried no name');

    assert.ok(Array.isArray(json.posts) && json.posts.length, 'the opening response carried no posts');
    assert.ok(
        json.pagination?.nextPageToken,
        'no pagination.nextPageToken in the opening response. The README documents the feed walk on that token, so revisit it or drop this test.'
    );
});
