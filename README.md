# Md Shahin Alam · Portfolio + Journal

Live: https://shahin4l.github.io/
Journal: https://shahin4l.github.io/blog/
Editor: https://shahin4l.github.io/admin/

A professional portfolio extended with a bilingual journal, article editor, moderated comments, reactions, image uploads, content backups and SEO publishing.

- [বাংলা ব্যবহার নির্দেশিকা](docs/ADMIN_GUIDE_BN.md)
- [Published site status](docs/DEPLOYMENT_STATUS.md)
- [Feature verification summary](docs/TEST_REPORT.md)

The site uses HTML, CSS and vanilla JavaScript with GitHub Pages and Supabase. No mandatory paid domain or subscription is required within the providers' free quotas.

## Development checks

Node.js 24 and Python 3; no npm dependencies required.

```sh
npm run check
npm test
python3 tests/build_blog_test.py
python3 scripts/build_blog.py
python3 scripts/package_pages.py
```

Do not publish credentials or private account information in source, articles or comments. Use the owner's separate configuration report for deployment-specific setup and recovery information.
