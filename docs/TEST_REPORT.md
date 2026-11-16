# Verification report — 16 November 2026

**Follow-up:** GitHub write access has now been rechecked successfully. Remote backup/review branches were created and source is being uploaded for review. Earlier 403 results below are historical; production migration and live acceptance tests remain pending.

**Result: local source and isolated tests pass; live acceptance testing remains blocked.**

For the latest real browser/backend results, see [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md). Preparation-time failures below are retained as history. The current local suite has 10 Node tests plus 2 Python tests.

## Executed

| Check | Outcome / evidence |
|---|---|
| JavaScript syntax | `npm run check` passed for shared, admin, blog, article and portfolio modules |
| Content security | 5 Node tests passed: raw script/HTML escaping, unsafe URL rejection, Markdown features, attribute escaping, restricted YouTube embeds |
| Guest endpoint | 4 Node tests passed against the actual TypeScript handler with mocked outbound database calls: origin/method/size checks; spam/input validation; server-only credential use and hashed identity; reaction UUID validation |
| SEO exporter | 2 Python tests passed: English/Bangla pages, safe fallback text, alternate metadata, sitemap and unpublished-page cleanup; failed API requests preserve prior output |
| Public database export | `python scripts/build_blog.py` succeeded against the real anonymous REST API; zero articles were returned; no draft/visitor data was accessed |
| Static deploy package | `python scripts/package_pages.py` succeeded; public output excludes database SQL, Edge source, tests, guide and repository metadata |
| Original assets/previews/source | Verified against baseline git commit; all existing project previews, TXT source, CSV, CV and portraits remain byte-identical |
| Local file references | Existing top-level HTML references checked; no missing local linked files found. External links/anchors not comprehensively tested |
| Existing Supabase policies | Read-only policy inspection and security advisor completed; proposed changes not applied |
| Remote writes | GitHub backup branch request returned `403 Resource not accessible by integration`; no updated remote branch/PR/site |
| Production migration | Rejected by automatic approval review; not applied or retried indirectly |
| Browser QA | Attempted local cloud-browser preview; page returned `Missing or invalid bearer token`; no visual layout acceptance obtained |

The 11 passing tests do not prove a working deployed database/authentication flow. Guest handler tests mock Supabase responses; SQL policies and transaction behavior need real PostgreSQL verification after approved migration.

## Still required before “complete”

| User checklist area | Status / required acceptance |
|---|---|
| Desktop, mobile, tablet | Not visually tested; inspect 1440px, 768px and 390px layouts, overflow and navigation |
| EN/বাংলা and persistence | Source implemented; browser interaction/persistence and legacy dictionary coverage unverified |
| Portfolio navigation, KPI tools, calculator | Baseline code preserved; browser regression tests pending |
| Four existing project previews | Files and preview backend stubs preserved; open each modal and standalone page, verify interface-only labels |
| Blog listing, featured/latest/popular | Frontend and indexed paginated query code implemented; live new schema absent |
| Search/category/tag/load more | Frontend implemented; real query plans/results and Bangla tokenization require deployed database test |
| Article reader, related posts | Frontend and fixture exporter tested; live published-content test pending |
| Admin login/logout/recovery | Not tested with a real authorized account; owner account/membership setup missing |
| Non-admin denial / protected data | SQL policies proposed; `database/verify_security.sql` supplied but not executed |
| Article create/edit/delete | UI/API code implemented; live CRUD pending |
| Draft/publish/unpublish/schedule | Timestamp policy and workflow implemented; real database/Actions behavior pending |
| Image upload restrictions | Size/MIME/signature code and bucket restriction proposed; live object test pending |
| Comment submission / moderation / replies | Handler validation unit-tested; real pending→approve/reject/spam/delete lifecycle pending |
| Email privacy | Emails are in non-exposed schema by design; real role/API denial checks pending |
| Rate limiting / concurrent dedup | SQL logic proposed; real PostgreSQL concurrency and gateway IP provenance tests pending |
| Reactions/share/copy/native sharing | Code present; live counts and browser actions pending |
| SEO/canonical/Schema/sitemap/404 | Generator fixture tests pass; deployed status codes, social crawlers, redirects and Actions pending |
| Database permissions and security advisors | Run role assertions and advisors after approved migration; auth leaked-password warning still exists |
| Performance / Core Web Vitals | No Lighthouse or field data collected; no scores claimed |

## Exact blockers and next steps

1. GitHub repository write permission must be repaired. Current branch `(root)` head is preserved; local backup branch exists. Integration cannot currently create a remote branch.
2. Approve the concrete production change set in `database/platform.sql`: add blog schema, RLS/grants, service-only engagement RPC and restricted image bucket; preserve existing posts/admin membership. The automatic approval rejection cited broad persistent production changes and authorization risk. No alternative write route was used.
3. Create the owner's administrator account and membership without sharing the password. Deploy the guest Edge function; set Pages source to GitHub Actions.
4. Execute `database/verify_security.sql` (transactional fixtures, rolled back), then run authenticated admin/non-admin tests and real device/browser acceptance.
5. Publish only after fixing observed failures. The original live website has not been replaced by this unverified build.
