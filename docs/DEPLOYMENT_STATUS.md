# Current deployment status — 16 November 2026

This file supersedes preparation-time blockers in older audit/guide snapshots.

- GitHub write access is restored. Backup branch: `backup/pre-blog-2026-11-16`. Review branch: `premium-portfolio-blog`; draft PR #1. The live Pages site remains unchanged.
- The user explicitly approved the prepared production database migration. `portfolio_blog_platform` was applied successfully as migration `20261116124556`.
- `journal-engagement` was deployed successfully and is ACTIVE, version 1. Guest requests deliberately require no account. The service credential remains in the managed server environment.
- Real PostgreSQL transactional tests passed: unpublished/scheduled article isolation, pending comment isolation, visitor write denial, private email access denial, privileged RPC access denial, pending comment insertion, repeated-reaction deduplication and authenticated non-admin article write denial. All fixtures were rolled back; remaining fixture article count is zero.
- Real anonymous REST requests succeeded for journal_catalog, categories, comments and article_stats. Categories returned four initial categories; other collections were empty.
- Real Edge requests rejected GET (405), an untrusted origin (403) and a nonexistent article (400).
- Security advisors report no public SECURITY DEFINER warning. Three private tables deliberately have RLS with no client policies (deny by default). Existing leaked-password protection warning remains; see https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No paid option was enabled.
- Administrator membership count remains zero. The owner must create their own Auth user and add its UID/email to admin_users without sending a password to the agent. See ADMIN_GUIDE_BN.md, section 'নিজের Admin account'. Do not rerun platform.sql: it is already applied.

Still pending: owner account/bootstrap, owner auth URL/signup configuration, real browser login/CRUD/moderation/image-upload tests, desktop/mobile/tablet visual QA, Pages Actions source selection and final publication. Do not merge the draft PR before these remaining checks are resolved. Previous 11 local automated tests passed, but they do not replace browser acceptance tests.


## Owner setup and browser verification update

- Owner admin membership is present (one configured admin). The owner signed in successfully through the secure browser authentication flow; no password/token was exposed to the agent.
- Actual browser tests passed: draft creation, editing, publication, future publication hiding, restoring due publication, bilingual article rendering, Markdown/code safety, category/tag/search, image upload, comment approve/reject visibility, backup download, dashboard language switching and logout with UI data cleared. Guest submission and repeated reactions were exercised against the real Edge endpoint, and email privacy was checked through anonymous reads.
- Desktop, 390px mobile and 768px tablet previews were inspected. Tablet navigation overflow was fixed and rechecked (scroll width equals viewport width). The old calculator duplicate input was corrected; numerical outputs were checked at 10,000 and 20,000 units. Four project modals open; attendance preview received the same backend-disconnected stub as the other previews to prevent its google-is-undefined error.
- Supabase organization plan was directly verified as free.
- A test portrait was uploaded successfully to the image bucket and remains available as an owner asset. Temporary test article/comment/reaction fixtures were deleted; the verification article count is zero.
- Remaining: production Pages deployment verification; auth recovery URL/signup settings still require owner Dashboard review because the connected tools do not expose auth settings. Password recovery mail delivery and field Core Web Vitals have not been measured.
