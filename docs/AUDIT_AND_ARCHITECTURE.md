# Audit and architecture — 16 November 2026

**Follow-up:** Repository write capability is now verified. Remote backup and implementation branches have been created. The prior 403 is retained below as audit history. Database changes remain unapplied pending explicit approval.

## Baseline

Repository: https://github.com/Shahin4L/shahin4l.github.io
Default branch: `(root)`
Commit: `33466592c346f0fe2b21598e8cc59b9f210f8ee3`

All 18 top-level repository files were enumerated. Every HTML, TXT, CSV and XML file was read programmatically; key portfolio sections, JS data, translation code, preview integration stubs and metadata were inspected. Image/PDF assets were retained byte-for-byte; CV visual contents were not audited. There were no package/build workflows in the baseline.

The original 1,967-line index holds styling, content, PROJECTS data, KPI tools, language dictionary and interaction code. Assets include two portraits and the CV. Four preview HTML files mirror Google Apps Script applications with preview backend stubs. Eight TXT files retain application source and one CSV sample supports the resource tracker. robots.txt and a minimal sitemap existed.

Preserved: hero/about/results, employment history, 11 teams, skills, education, certifications, professional development, 31 KPI definitions and calculator, project descriptions/modal previews, CV download, contact/social links, five LinkedIn publications and existing bilingual dictionary. No professional claims or employment dates were invented. No blog posts were fabricated under the owner's name.

## Findings

- No blog database connection, article routes, CMS, guest comments or reaction backend existed in repository source.
- Large inline source is harder to maintain; retained to avoid a needless wholesale rebuild. New features live in separate files.
- Existing previews intentionally cannot perform real Apps Script operations. Their source remains unchanged.
- A local top-level HTML reference check found no missing local linked files. External destination availability and in-page anchor completeness were not fully validated.
- Existing translation tree walker included script/style text; excluded these and CMS-injected journal/banner content from the old dictionary pass.
- Supabase project `shahin4l-platform` is healthy. Existing `posts` and `admin_users` tables had zero rows at inspection and RLS enabled. Admin membership is not configured.
- Existing posts SELECT policy did not constrain publication timestamp; proposed replacement adds a non-null due date so scheduled content is not public early.
- Existing is_site_admin SECURITY DEFINER helper was flagged by security advisors. Proposed implementation uses SECURITY INVOKER and reads only the caller's permitted membership row.
- Advisor also reported leaked-password protection disabled. Its availability/plan eligibility must be checked; no paid feature is required here.

## Final structure

| Path | Responsibility |
|---|---|
| index.html + css/portfolio-upgrade.css | Existing portfolio, restrained corporate/editorial refinement |
| js/portfolio.js | Journal teaser and admin-managed announcement |
| blog/index.html + js/blog.js | Featured/latest/popular, category/tag/search, load more |
| blog/article.html + js/article.js | Article reader, sharing, reactions, moderated replies |
| blog/{slug}/index.html | Generated real clean URLs and crawler metadata |
| blog/{slug}/bn/index.html | Generated Bangla metadata/content when supplied |
| admin/index.html + js/admin.js | Authenticated editor and moderation workspace |
| js/core.js | REST calls, language state, safe Markdown subset, reusable cards |
| js/config.js | Documented public publishable key and project URL; no secrets |
| database/platform.sql | Reviewed first-install migration; not applied |
| supabase/functions/journal-engagement/index.ts | Guest input validation and privileged narrowly scoped submission |
| scripts/build_blog.py | Public-only article export, cleanup and sitemap |
| scripts/package_pages.py | Public deployment tree without database/admin-source docs |
| .github/workflows/publish-blog.yml | Tests, hourly export and explicit Pages deployment |
| docs/ADMIN_GUIDE_BN.md | Setup, publishing, moderation, costs and recovery |

## Data model and permissions

| Table/schema | Data | Public access | Authorized admin access |
|---|---|---|---|
| public.posts | Article metadata, manual EN/BN content, tags, flags, timestamps | Due published rows only | CRUD, including drafts |
| public.admin_users | Existing owner-maintained membership | No rows | Read own membership only; no self-enrollment |
| public.categories | Manual EN/BN labels | Read | Manage |
| public.comments | Name, body, date, article, parent, moderation status | Approved comments on due published articles | Moderate/delete |
| private.comment_contacts | Comment email keyed by comment ID | None | No browser access; owner database access only |
| private.reactions | Random browser UUID + article + reaction type | None | Server-only aggregate writes |
| public.journal_catalog (security-invoker view) | Summary listing with reaction ranking | Underlying published-row RLS | Underlying RLS |
| public.article_stats | Aggregate likes/useful counts | Published article counts | No browser write grant |
| private.abuse_events | Salted hashed connection identities, type, timestamp | None | Server-only |
| public.site_content | Bilingual announcement | Read | Manage |
| public.activity_log | Entity/action/time, no content or email | None | Read |
| storage.article-images | JPEG/PNG/WebP, max 2 MB | Public image URLs | Upload/update/delete |

All exposed tables enable RLS. Explicit SQL grants permit operations at the table level; matching RLS determines which rows are authorized. `authenticated` is not treated as synonymous with admin. User-editable metadata is not used for authorization. Admin membership changes require the project owner. Comments cannot be inserted directly by visitors. The public Edge endpoint accepts guest requests, validates bounded input, hashes a connection identifier and calls a service-role-only RPC. That RPC defaults comments to pending, verifies the target article/reply, serializes abuse/reaction writes with transaction locks and applies caps. The service key is read only from the managed Edge environment. No new auth users were accessed/created and no credentials were generated.

Raw HTML is escaped. Inline Markdown uses tokenized escaping. Code is escaped; embeds allow a fixed YouTube URL/ID format only. Comment names/messages use text escaping. Browser upload restrictions check size, MIME and image signatures; bucket restrictions enforce size/MIME and admin authorization server-side. Client constraints are not the authorization boundary. CSP constrains new blog/admin pages. GitHub Pages cannot set server headers such as frame-ancestors; no such protection is claimed.

## Implementation / rollout order

1. Preserve baseline in local backup branch and git history. Remote backup blocked by GitHub integration 403.
2. Add isolated frontend/CMS and migration without deleting existing content.
3. Validate renderer, Edge request handling, generator, source syntax and deployment package.
4. Obtain concrete approval for proposed production schema/policy changes; repair repository write capability.
5. Apply migration atomically, configure the owner account and deploy guest Edge function.
6. Push review branch, run DB role/security tests and genuine browser/device tests, then publish Pages.
7. Confirm live article lifecycle, moderation, email privacy, invalid-user denial and quotas before declaring complete.

No production schema/source modifications were completed. The database apply action was rejected by automatic approval review for broad persistent production changes. This was not retried through another API or split into indirect writes. The requested auth-record audit read was also rejected and replaced by policy-only inspection. Code continues locally so the final approval is about a concrete change set.
