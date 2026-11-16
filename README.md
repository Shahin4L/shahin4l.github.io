# Md Shahin Alam · Portfolio + Journal

**Access update:** GitHub write access now works. The implementation is being uploaded to `premium-portfolio-blog` for review. The production migration is still pending approval; the live site is unchanged.

Upgrade of the existing static portfolio, preserving existing projects, previews and professional content. HTML/CSS/vanilla JavaScript, GitHub Pages, Supabase PostgreSQL/Auth/Storage/Edge. No paid service required within free quotas.

**Deployment status:** source prepared locally; repository write returned GitHub 403; production database migration was blocked by automatic approval review. Not a verified live CMS yet.

- [বাংলা setup / admin guide](docs/ADMIN_GUIDE_BN.md)
- [Audit, architecture and security](docs/AUDIT_AND_ARCHITECTURE.md)
- [Test report and remaining work](docs/TEST_REPORT.md)
- [Proposed first-install SQL](database/platform.sql)

Latest deployment and browser verification: [DEPLOYMENT_STATUS.md](docs/DEPLOYMENT_STATUS.md).

## Local checks

Use Node.js 24 and Python 3. No npm dependencies are required.

```sh
npm run check
npm test
python3 tests/build_blog_test.py
python3 scripts/build_blog.py
python3 scripts/package_pages.py
python3 -m http.server 8000
```

The exporter uses only the documented public publishable key. No service key belongs in this repository. Guest endpoint uses Supabase-managed server credentials. Copying the source alone does not configure the database, admin membership, Edge deployment or GitHub Pages Actions source.
