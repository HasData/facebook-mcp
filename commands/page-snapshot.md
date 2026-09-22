---
description: What a public Facebook page looks like right now, with its recent posts
---

Snapshot a public Facebook page.

Ask me for the page handle if I have not given it. The handle is the part of the URL after facebook.com, or the numeric id from a `profile.php?id=` URL.

Then:

1. Call `hasdata_facebook_profile_getFacebookProfile` with that handle.
2. Check that the payload carries a profile. If it carries `error` instead, tell me the page is missing, private or deleted, and stop.
3. Report the name, category, `likesCount`, `talkingAboutCount`, `checkInsCount`, the `phone`, the `owner` and the site as `websiteUrl` rather than the `website` display text.
4. Keep everything you need from this first response before paging, because a call with `nextPageToken` returns only `posts` and `pagination`.
5. Follow `nextPageToken` for two more pages, then summarise the feed: how often they post, what the posts are about, and which ones drew the most reactions.
6. Quote `followersCount` as the string it is, label included. It is not a number, and converting it silently loses the fact that Facebook rounded it.

If the page posts rarely, say that plainly. A quiet page is a finding, not a gap to fill with adjectives.
