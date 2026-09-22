# Facebook MCP Server

<!-- mcp-name: com.hasdata/facebook -->

A hosted Model Context Protocol (MCP) server that gives Claude, Cursor, Windsurf and any other MCP client one read-only Facebook tool. Look up a public page or profile by its handle and get the page record with its exact like count, contact details and owner, plus the post feed with reactions, comments and shares, all as structured JSON, with no Meta developer app and nothing to host.

It reads public Facebook pages that a signed-out visitor can see. Groups and private personal accounts are out of scope.

**1,000 free credits every month, no card required**, which is 100 Facebook calls at the 10-credit rate.

```
https://mcp.hasdata.com/api/mcp?apis=facebook
```

[![Glama score](https://glama.ai/mcp/servers/HasData/facebook-mcp/badges/score.svg)](https://glama.ai/mcp/servers/HasData/facebook-mcp)
[![tool contract](https://github.com/HasData/facebook-mcp/actions/workflows/contract.yml/badge.svg)](https://github.com/HasData/facebook-mcp/actions/workflows/contract.yml)
[![MCP](https://img.shields.io/badge/MCP-remote%20%7C%20streamable%20HTTP-6366f1?style=flat-square)](https://mcp.hasdata.com/api/mcp?apis=facebook)
[![Tools](https://img.shields.io/badge/tools-1-10b981?style=flat-square)](#tools)
[![npm](https://img.shields.io/npm/v/@hasdata/facebook-mcp?style=flat-square&logo=npm&label=npm&color=cb3837)](https://www.npmjs.com/package/@hasdata/facebook-mcp)
[![PyPI](https://img.shields.io/pypi/v/hasdata-facebook-mcp?style=flat-square&logo=pypi&logoColor=white&label=PyPI&color=3775a9)](https://pypi.org/project/hasdata-facebook-mcp/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

## Contents

- [What you need](#what-you-need)
- [Quick start](#quick-start)
- [Example prompts](#example-prompts)
- [Tools](#tools)
- [Errors and failure paths](#errors-and-failure-paths)
- [Pricing, free tier and limits](#pricing-free-tier-and-limits)
- [How it compares](#how-it-compares)
- [FAQ](#faq)
- [HasData links](#hasdata-links)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## What you need

An MCP client and a HasData API key from the [dashboard](https://app.hasdata.com/sign-up?utm_source=github&utm_medium=syndication&utm_campaign=facebook-mcp), free to create with no card, and the free tier covers about 100 calls a month at the 10-credit rate. This is a remote server, so the simplest path is a URL and an `x-api-key` header, with no container to run. A client that only speaks stdio reaches it through a thin launcher, published as `@hasdata/facebook-mcp` on npm and `hasdata-facebook-mcp` on PyPI, shown below.

## Quick start

The server URL is the same for every client. We run it hands-on in Claude Code and Claude Desktop. The other blocks follow each client's own documented format for a remote server.

| Field | Value |
| :--- | :--- |
| URL | `https://mcp.hasdata.com/api/mcp?apis=facebook` |
| Transport | HTTP, streamable |
| Auth header | `x-api-key: HASDATA_API_KEY` |

Clients with OAuth support can add the same URL as a connector and sign in without putting a key in a config file.

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add --transport http facebook "https://mcp.hasdata.com/api/mcp?apis=facebook" \
  --header "x-api-key: HASDATA_API_KEY"
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Settings, then Connectors, then Add custom connector, then paste `https://mcp.hasdata.com/api/mcp?apis=facebook` and sign in.

For the config-file route, Claude Desktop loads only local (stdio) servers, so it reaches a remote server through a stdio launcher. The `@hasdata/facebook-mcp` package is that launcher, and it reads the key from the environment. Add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "facebook": {
      "command": "npx",
      "args": ["-y", "@hasdata/facebook-mcp"],
      "env": { "HASDATA_API_KEY": "YOUR_KEY" }
    }
  }
}
```

For Python instead of Node, swap the launcher for the PyPI package, which `uvx` runs without a manual install:

```json
{
  "mcpServers": {
    "facebook": {
      "command": "uvx",
      "args": ["hasdata-facebook-mcp"],
      "env": { "HASDATA_API_KEY": "YOUR_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>Cursor</b></summary>

`~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` for one:

```json
{
  "mcpServers": {
    "facebook": {
      "url": "https://mcp.hasdata.com/api/mcp?apis=facebook",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

`~/.codeium/windsurf/mcp_config.json`. Windsurf calls the field `serverUrl`, not `url`:

```json
{
  "mcpServers": {
    "facebook": {
      "serverUrl": "https://mcp.hasdata.com/api/mcp?apis=facebook",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>VS Code</b></summary>

`.vscode/mcp.json` in the workspace:

```json
{
  "servers": {
    "facebook": {
      "type": "http",
      "url": "https://mcp.hasdata.com/api/mcp?apis=facebook",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

## Example prompts

- How many people like the Nike page, and how many are talking about it this week?
- Pull the contact details and the confirmed owner of this Facebook page.
- Read the last ten posts on this page and tell me which got the most shares.
- Compare the reaction mix on this brand's posts with its competitor's.
- Is this Facebook page verified, and what category does it list?
- Walk this page's feed back to the start of the month and list the posts with video.

One call returns the page record and the newest post. Walking the feed takes one more call per three posts, using the token the previous response returns.

## Tools

| Tool | What it returns |
| --- | --- |
| `hasdata_facebook_profile_getFacebookProfile` | Fetches a public Facebook page or profile by handle (username, @username or numeric profile id) and returns page id, name, username, category, bio, exact likes and…. 10 credits a call |

One tool, 10 credits per successful call.

### Get Facebook profile

[`hasdata_facebook_profile_getFacebookProfile`](https://docs.hasdata.com/apis/facebook/profile?utm_source=github&utm_medium=syndication&utm_campaign=facebook-mcp)

A public page or profile, with its feed.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `handle` | string | yes | The username, with or without `@`, or the numeric id from a `profile.php?id=…` URL |
| `language` | string | | Language the page is rendered in, one of 32 codes such as `en`, `de`, `pt` or `zh-hans` |
| `nextPageToken` | string | | Cursor from the previous response, to read the next three posts |

The first call returns four blocks. `profile` is the page record, `posts` holds the newest post, `photos` is the strip of recent images, and `pagination` carries `postsPerPage`, `nextPage` and the `nextPageToken` to continue with.

Every call made with a token returns `posts` and `pagination` only, three posts at a time, with a fresh token until the feed ends and the token disappears.

```json
{
  "profile": {
    "id": "100044541544829",
    "pageId": "15087023444",
    "name": "Nike",
    "username": "nike",
    "url": "https://www.facebook.com/nike",
    "category": "Sportswear Store",
    "biography": "Just Do It.",
    "likesCount": 39545204,
    "talkingAboutCount": 173971,
    "checkInsCount": 18299,
    "followersCount": "39M followers",
    "followingCount": "24 following",
    "verified": true,
    "website": "nike.com",
    "websiteUrl": "http://nike.com/",
    "phone": "+48 58 881 27 61",
    "owner": { "name": "NIKE, Inc.", "isConfirmed": true },
    "profilePicUrl": "https://scontent.fmex5-1.fna.fbcdn.net/v/t39.30808-1/284964043_10159903868513445_7696353984967674128_n.jpg",
    "coverPhotoUrl": "https://scontent.fmex25-1.fna.fbcdn.net/v/t39.30808-6/285211224_10159903868008445_5477337468887983165_n.png"
  },
  "posts": [
    {
      "id": "1393461115481927",
      "url": "https://www.facebook.com/reel/2166091230582141/",
      "text": "Leave your limits at the surface. #JustDoIt",
      "hashtags": ["#JustDoIt"],
      "timestamp": "2025-09-15T16:01:59.000Z",
      "reactionsCount": 7885,
      "commentsCount": 2461,
      "sharesCount": 1124,
      "reactions": [{ "type": "Like", "count": 6491 }],
      "media": [{ "id": "2166091230582141", "type": "Video" }]
    }
  ],
  "photos": [{ "id": "1095811278580247", "type": "Photo", "image": "https://scontent.fmex22-1.fna.fbcdn.net/v/t39.30808-6/471313661_18515827156020081_2460706748949541958_n.jpg" }],
  "pagination": { "postsPerPage": 3, "nextPage": 2, "nextPageToken": "eyJjdXJzb3IiOiJDZzhPYjNKbllXNXBZMTlqZFhKemIzS…" }
}
```

## Errors and failure paths

Plan for these rather than assuming a happy path.

**Three of the counts are numbers and two are strings, and that is not a bug.** `likesCount`, `talkingAboutCount` and `checkInsCount` are the exact figures Facebook publishes. `followersCount` and `followingCount` arrive as the rounded, localised text the page shows, `"39M followers"` in English and `"39 Mio. Follower"` when `language` is `de`. Compare with the numbers, display the strings.

**`language` changes the strings, not the numbers.** `category` moved from `Sportswear Store` to `Sportbekleidungsgeschäft` under `de`, while `likesCount` stayed a number. Pick the language for the reader, not for the maths.

**A page that does not exist, was deleted or is not public still answers 200.** The response then carries `error` instead of `profile`, and the call is billed. Test for `profile` before you read it. Groups and private personal accounts land here too.

**The first page of the feed holds one post, not three.** `postsPerPage` says 3, and pages two onward do return three, but the opening response carries the newest post alone alongside the profile and photos. Count what you got rather than what the field promises.

**Later pages drop `profile` and `photos`.** A call made with `nextPageToken` returns `posts` and `pagination` only. Keep the profile from the first response instead of expecting it again.

**The token is the only way forward.** `nextPage` is a page number for your own bookkeeping, and there is no parameter that takes it. Pass the previous `nextPageToken` unchanged, and stop when a response arrives without one.

**Contact details are what the page shows to the request, not a canonical record.** A global brand page can surface a regional phone number, and `website` is the display text while `websiteUrl` is the link. Read `owner.isConfirmed` before you treat the owner name as verified.

**Image URLs are Facebook CDN links with signed parameters.** They expire. Fetch what you need promptly and store the file, not the URL.

Results that carry data also carry a `requestMetadata.id` worth quoting in support.

## Pricing, free tier and limits

The Facebook tool costs **10 credits per successful call**. Response size does not change the price, and a page of the feed costs the same as the opening call, so a thirty-post read is one call plus ten more.

The free tier is **1,000 credits every month with no card**, which is 100 Facebook calls at the base rate. It renews with the billing cycle, so a low-volume agent runs on the free tier indefinitely.

Paid plans start at **$59 a month** for 200,000 credits, which is 20,000 calls. The unit price falls with volume, from **$2.95 per 1,000 calls** on the entry plan to **$1.19** on Basic and **$0.83** across the Growth tiers. Current figures live on the [pricing page](https://hasdata.com/prices?utm_source=github&utm_medium=syndication&utm_campaign=facebook-mcp).

Your plan also sets concurrency. The free tier allows 1 request at a time, Startup 5, Basic 15, and the Growth tiers run from 50 to 500. Retry on the 429 with a backoff in anything unattended, because an agent that enriches a list of pages will reach the ceiling before you do.

A request that comes back non-200 is not billed. A successful call that finds no page is still a call.

## How it compares

Meta's Graph API is the official route to page data, and it is built for a different situation.

| | Meta Graph API | This server |
| :--- | :--- | :--- |
| Eligibility | A Meta developer app, an access token, and App Review for pages you do not manage | An API key |
| Pages you can read | Your own pages in full, others only through reviewed permissions | Any public page or profile |
| Setup | App creation, permissions, token handling, review | One header |
| Post reactions | Per-type counts on pages you manage | Per-type counts on any public page |
| Language of the record | Your app's locale | Any of 32, per call |
| Cost | Free within rate limits | Paid past the free tier, 10 credits a call |

The row that decides it is which pages you can read. The Graph API is the right tool for pages you administer, and its Page Public Content Access permission for everything else needs a business verification and a review with a stated use case. When the page is yours, use the Graph API, it is free and complete.

## FAQ

### Is there an official Facebook MCP server?

Meta does not publish one for reading public pages. This one is maintained by HasData and reads public Facebook pages.

### What is a Facebook MCP server?

An MCP server exposes tools an AI client can call. This one turns a public Facebook page and its feed into JSON an agent can reason over, without a browser or a scraping library in your stack.

### Do I need a Facebook account or a Meta developer app?

No. The only credential is your HasData key.

### Can I read a personal profile or a group?

A public personal profile works the same way as a page. Private accounts and groups are not supported and come back with the not-available error.

### Can I pass a numeric id instead of a username?

Yes. Both the `id` and the `pageId` a response returns resolve as `handle`, so a page reached once by name can be tracked by id afterwards.

### How do I read the whole feed?

Call once with the handle, then keep calling with the `nextPageToken` from each response until a response arrives without one. Three posts come back per token.

### Why is `followersCount` text while `likesCount` is a number?

Because that is how Facebook publishes them. The like count and the talking-about count are exact on the page, and the follower count is shown rounded and localised. The response passes both through as they are.

### Can I use this together with other HasData APIs?

Yes. One key covers everything, and one endpoint serves them all through the `apis` parameter. Point a client at `?apis=facebook,instagram` to get both tool sets in one connection, or at [`mcp.hasdata.com/api/mcp`](https://docs.hasdata.com/mcp-server?utm_source=github&utm_medium=syndication&utm_campaign=facebook-mcp) for the full catalogue.

### Is HasData affiliated with Meta or Facebook?

No. HasData is an independent service and is not affiliated with, endorsed by, or sponsored by Meta. Facebook is a trademark of its respective owner. The tools work with publicly available data only, and you are responsible for using the results in line with Meta's terms and the law that applies to you.

### Compliance and personal data

A page record for a business is a business record, and a public personal profile is personal data in the plainest sense, with a name, a photo, a bio and a public feed. The tool does not tell the two apart, so your purpose has to. Keep to what your use case needs, do not build profiles of individuals you have no business with, and check your obligations under the GDPR, the CCPA and Meta's terms before storing anything. Contact details on a page are published for customers, and marketing to them is regulated separately again.

## HasData links

- [Facebook Profile API documentation](https://docs.hasdata.com/apis/facebook/profile?utm_source=github&utm_medium=syndication&utm_campaign=facebook-mcp), the REST endpoint behind this tool
- [MCP server documentation](https://docs.hasdata.com/mcp-server?utm_source=github&utm_medium=syndication&utm_campaign=facebook-mcp)
- [Pricing](https://hasdata.com/prices?utm_source=github&utm_medium=syndication&utm_campaign=facebook-mcp)
- [Dashboard](https://app.hasdata.com/sign-up?utm_source=github&utm_medium=syndication&utm_campaign=facebook-mcp)

Other HasData MCP servers: [Instagram](https://github.com/HasData/instagram-mcp), [TikTok](https://github.com/HasData/tiktok-mcp), [YouTube](https://github.com/HasData/youtube-mcp), [Google Search](https://github.com/HasData/google-search-mcp), [Google Images](https://github.com/HasData/google-images-mcp), [Google Scholar](https://github.com/HasData/google-scholar-mcp), [Google Maps](https://github.com/HasData/google-maps-mcp), [Google Trends](https://github.com/HasData/google-trends-mcp), [Google Flights](https://github.com/HasData/google-flights-mcp), [Bing](https://github.com/HasData/bing-mcp), [DuckDuckGo](https://github.com/HasData/duckduckgo-mcp), [Amazon](https://github.com/HasData/amazon-mcp), [Walmart](https://github.com/HasData/walmart-mcp), [Shopify](https://github.com/HasData/shopify-mcp), [Yelp](https://github.com/HasData/yelp-mcp), [Yellow Pages](https://github.com/HasData/yellowpages-mcp), [Zillow](https://github.com/HasData/zillow-mcp), [Redfin](https://github.com/HasData/redfin-mcp), [Airbnb](https://github.com/HasData/airbnb-mcp), [Booking.com](https://github.com/HasData/booking-mcp), [Indeed](https://github.com/HasData/indeed-mcp), [Glassdoor](https://github.com/HasData/glassdoor-mcp), [Web Scraping](https://github.com/HasData/web-scraping-mcp).

## Development

The launcher is a thin stdio bridge to the remote server, so there is nothing to build.

```bash
npm install
HASDATA_API_KEY=your_key_here npm test
```

The tests in `test/` assert the tool contract, the part that can break without a commit here. They check that `?apis=facebook` returns the one expected tool, that its name has not changed, that it still requires `handle` and carries a description, that `language` still offers the codes this README names, and that the key in use is actually accepted.

One test reads a live page and asserts the two things this README leans on: that `likesCount` is a number rather than display text, and that `pagination.nextPageToken` arrives, because without the token the feed walk this README documents does not exist. That call costs 10 credits, which is the price of a canary that can fail for the right reason.

The contract suite also runs weekly on a schedule, because the upstream tool list can change without anyone touching this repository.

## Contributing

A tool table, a response sample or a documented behaviour that does not match reality is worth an issue. There is a template for exactly that. Pull requests are welcome for the same, and for anything in the launcher.

## License

MIT, see [LICENSE](LICENSE).
