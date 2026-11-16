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
