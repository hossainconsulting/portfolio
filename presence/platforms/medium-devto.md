# Medium and dev.to (optional)

Both are search-indexed long-form hosts. They are worth it only as
**canonical-tagged reposts** of pieces that already exist on the hub or as
LinkedIn articles; original content there splits the audience.

## Setup

| Platform | Handle | Canonical |
|---|---|---|
| Medium | `@hossainconsulting` | Import via "Import a story" from the hub URL; Medium sets `rel=canonical` automatically. |
| dev.to | `hossainconsulting` | Set `canonical_url` in the post front matter to the hub or repo document URL. |

Bio: the X bio. Link: the hub.

## Content

Build logs and incident reviews only (pillars 1 and 4). Tag: `salesforce`,
`crm`, `ai`, `agents`. Publish 7 days after the original.

## Decision point

Start only if, after 60 days, LinkedIn articles show search impressions in
Search Console. If they do not, long-form is not being found through search
and these will not change that.
