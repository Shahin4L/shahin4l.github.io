# Md Shahin Alam — Portfolio + Journal ব্যবহার নির্দেশিকা

**Access update:** GitHub write access এখন কাজ করছে; `backup/pre-blog-2026-11-16` remote branch তৈরি হয়েছে এবং implementation `premium-portfolio-blog` review branch-এ তোলা হচ্ছে। নিচের আগের 403-সংক্রান্ত তথ্য preparation-time record; GitHub access setup পুনরায় করার প্রয়োজন নেই। Database migration এখনো অনুমোদনের অপেক্ষায়।

**অবস্থা: implementation প্রস্তুত; production deployment ও database migration এখনো হয়নি।** GitHub write permission এবং database পরিবর্তনের অনুমোদন পাওয়ার পর live পরীক্ষা শেষ করতে হবে। কোডের উপস্থিতি live কাজ করার প্রমাণ নয়।

## ১. কী সংরক্ষিত আছে

পুরোনো portfolio-এর পরিচিতি, অভিজ্ঞতা, ১১টি operational team, education, professional development, results, skills, ৩১টি KPI definition, calculator, CV, social links ও LinkedIn articles রাখা হয়েছে। চারটি project preview এবং তাদের frontend/backend source files অপরিবর্তিত। পুরোনো project preview-গুলো Apps Script backend-এর সঙ্গে যুক্ত নয়; এগুলো interface preview, live application নয়।

নতুন Journal এবং Admin আলাদা folder-এ। কোনো visitor account প্রয়োজন নেই। বাংলা অনুবাদ আপনি আলাদা করে লিখবেন; সিস্টেম আপনার লেখা নিজে অনুবাদ করে না।

## ২. প্রথম setup — একবার করতে হবে

### GitHub access

1. GitHub-এ আপনার অ্যাকাউন্ট দিয়ে লগইন করুন।
2. Settings → Applications → Installed GitHub Apps → ChatGPT/Codex-এর GitHub app → Configure খুলুন।
3. Repository access-এ `Shahin4L/shahin4l.github.io` অন্তর্ভুক্ত আছে নিশ্চিত করুন। App যদি updated permissions গ্রহণের অনুরোধ দেখায়, repository **Contents: Read and write**, **Pull requests: Read and write** এবং workflow file পরিবর্তনের প্রয়োজনীয় permission যাচাই করে অনুমোদন দিন।
4. App-এ write permission উপলব্ধ না হলে GitHub Desktop দিয়ে branch push করা যাবে; archive-তে `changes.patch` দেওয়া আছে। Settings-এর UI account/app অনুযায়ী আলাদা হতে পারে।
5. এই session-এ backup branch তৈরির API request-এ GitHub 403 দিয়েছে। Remote-এ কোনো source পরিবর্তন হয়নি।

### Database পরিবর্তন

Project: `shahin4l-platform` (`gckaucdwkyhmctfnimbb`)।

এই পরিবর্তন production database-এ নতুন tables/policies/storage bucket তৈরি করবে। Automatic approval review প্রয়োগ আটকে দিয়েছে; এটি অনুমোদনের জন্য প্রস্তুত script, প্রয়োগ হয়েছে এমন নয়।

অনুমোদনের পর agent connected service দিয়ে `database/platform.sql` প্রয়োগ করতে পারবে। নিজে setup করলে:

1. [Supabase Dashboard](https://supabase.com/dashboard) → `shahin4l-platform` খুলুন।
2. আগে Database backup/export নিন। বর্তমান audit-এ `posts` ও `admin_users` খালি ছিল।
3. SQL Editor → New query খুলুন।
4. `database/platform.sql`-এর সম্পূর্ণ লেখা paste করে review করুন।
5. পরিবর্তন অনুমোদন করলে Run চাপুন। Script একটি transaction-এ কাজ করে; ব্যর্থ হলে পরিবর্তন commit হওয়ার কথা নয়। এই first-install script সফলভাবে একবার চালাবেন; পুনরায় চালানোর script নয়।
6. কোনো error হলে script আবার আংশিক চালাবেন না; error message দেখিয়ে সাহায্য নিন।

### নিজের Admin account

আপনার password agent তৈরি বা জানতে চায় না।

1. Supabase → Authentication → Users → Add user → Create new user খুলুন।
2. নিজের নিয়ন্ত্রণে থাকা email দিন। অন্তত ১২ অক্ষরের unique password দিন; password manager ব্যবহার করতে পারেন।
3. প্রয়োজন হলে Auto confirm user নির্বাচন করুন—এটি কেবল আপনার নিজের verified email-এর জন্য।
4. তৈরি করা user-এর **UID** copy করুন।
5. Table Editor → `admin_users` → Insert row খুলুন। `user_id`-এ UID, `email`-এ একই email দিন; Save করুন।
6. `admin_users`-এ থাকা ব্যক্তিই website content পরিবর্তন করতে পারে। সাধারণ Supabase account তৈরি করলেই কেউ admin হবে না।
7. Authentication → Sign In / Providers → Email-এ public signup বন্ধ করুন। Anonymous sign-in চালু করার প্রয়োজন নেই।
8. Authentication → URL Configuration: Site URL `https://shahin4l.github.io`; Redirect URLs-এ `https://shahin4l.github.io/admin/` যোগ করুন।
9. Password reset email Supabase-এর default mail service-এ কেবল project team-এর অনুমোদিত email-এ যেতে পারে এবং কঠোর rate limit আছে। নিজের team email ব্যবহার করুন। প্রয়োজন হলে project owner Dashboard-এর Users থেকে reset করতে পারবেন। কোনো paid mail service দরকার নেই।

### Guest comments ও reactions

1. Supabase → Edge Functions → Deploy a new function → Via Editor খুলুন।
2. নাম দিন `journal-engagement`।
3. `supabase/functions/journal-engagement/index.ts`-এর সম্পূর্ণ code দিন।
4. এই function visitor login ছাড়াই ব্যবহার করতে হবে। Function settings-এ gateway **Verify JWT** বন্ধ রাখতে হবে; function নিজেই guest input পরীক্ষা করে। অন্য function-এর JWT setting পরিবর্তন করবেন না।
5. Supabase নিজে runtime-এ `SUPABASE_URL` ও server-only `SUPABASE_SERVICE_ROLE_KEY` দেয়। এগুলো frontend/GitHub-এ paste করবেন না।
6. Deploy করুন। Database script আগে সফলভাবে প্রয়োগ করা থাকতে হবে।
7. Public form দিয়ে একটি test comment পাঠান, pending অবস্থায় public API-তে অদৃশ্য আছে নিশ্চিত করুন, admin থেকে approve করে আবার দেখুন। Deployment-এর পর agent এই পরীক্ষাগুলো করবে।

### GitHub Pages deployment

1. Repository → Settings → Pages → Build and deployment → Source: **GitHub Actions** নির্বাচন করুন।
2. বর্তমান default branch-এর নাম `(root)`—`main` নয়। Workflow সেই branch-এ প্রকাশের জন্য configured।
3. পরিবর্তন commit/push হওয়ার পর Actions → **Publish portfolio and journal** → Run workflow নির্বাচন করুন।
4. সব ধাপ সবুজ হলে public site খুলুন। প্রথম প্রকাশে কয়েক মিনিট সময় লাগতে পারে।
5. Workflow প্রতি ঘণ্টায় ১৭ মিনিটে article pages ও sitemap refresh করে। GitHub schedule exact সময়ে চলার নিশ্চয়তা দেয় না; public repository-তে দীর্ঘ inactivity-তে schedule disable হতে পারে। প্রয়োজনে Run workflow চাপুন।

## ৩. নতুন লেখা প্রকাশ

1. `https://shahin4l.github.io/admin/` খুলে email/password দিয়ে Sign in করুন।
2. **+ New article / + নতুন লেখা** চাপুন।
3. English title, summary এবং মূল লেখা দিন। English title required; মূল English text required। বাংলা সংস্করণ চাইলে বাংলা title, summary ও content আলাদাভাবে লিখুন।
4. Slug ছোট ইংরেজি অক্ষর ও হাইফেন দিয়ে হবে: `building-a-better-sort-operation`। প্রকাশের পরে এটি বদলালে আগের link ভাঙতে পারে।
5. Category বাছুন, comma দিয়ে tags লিখুন। বাংলা tag-ও সরাসরি লিখতে পারবেন।
6. Cover upload-এ JPEG/PNG/WebP, সর্বোচ্চ 2 MB। অথবা নিজের HTTPS image link দিন। SVG/HTML upload গ্রহণ করা হয় না।
7. SEO title ও description দুই ভাষায় দিতে পারেন।
8. **Preview** চাপুন। এরপর Status **Draft** রেখে Save করলে public হবে না।
9. Publish করতে Status **Published** করে Save করুন। Publish time খালি থাকলে বর্তমান সময় ব্যবহার হবে।
10. ভবিষ্যতের সময় দিলে সেই সময়ের আগে public database read-এ দেখা যাবে না। সময় হলে blog listing-এ দেখা যাবে; crawler/social-ready page পরবর্তী successful workflow deployment-এ তৈরি হবে।
11. Featured নির্বাচন করলে journal-এর নির্বাচিত লেখায় আসবে। Comments enabled বন্ধ করলে নতুন comment নেওয়া হবে না।
12. দ্রুত social preview দরকার হলে GitHub Actions থেকে Run workflow চাপুন।

বাংলা-only article-এর জন্য আপাতত English title ও English content required field আছে। চাইলে নিজের সংক্ষিপ্ত English version লিখুন; বাংলা content-এ পূর্ণ বাংলা লেখা দিন। স্বয়ংক্রিয় অনুবাদ করা হয় না।

### লেখার format

```markdown
## একটি শিরোনাম

এটি সাধারণ paragraph। **বোল্ড** এবং *ইটালিক* ব্যবহার করা যায়।

- একটি বিষয়
- আরেকটি বিষয়

1. প্রথম ধাপ
2. দ্বিতীয় ধাপ

[লিংকের নাম](https://example.com)

![ছবির caption](https://example.com/image.jpg)

> উদ্ধৃতি লিখুন

| বিষয় | ফলাফল |
| --- | --- |
| দক্ষতা | উন্নত |
```

Code block-এর আগে ও পরে তিনটি backtick দিন। নিরাপদ YouTube embed-এর জন্য আলাদা লাইনে `@[youtube](https://www.youtube.com/watch?v=VIDEO_ID)` লিখুন; VIDEO_ID ১১ অক্ষরের আসল video ID হবে। অন্য arbitrary HTML/iframe embed চালানো হয় না। Inline formatting সীমিত Markdown subset; এটি পূর্ণ Word editor নয়।

## ৪. মন্তব্য অনুমোদন

1. Admin → **Moderation / মন্তব্য অনুমোদন** খুলুন।
2. Pending নির্বাচন করলে নতুন মন্তব্য দেখা যাবে। নাম, লেখা, article এবং তারিখ মিলিয়ে পড়ুন।
3. **Approve** = public; **Reject** = গোপন রেখে প্রত্যাখ্যান; **Spam** = spam হিসেবে চিহ্নিত; **Delete** = স্থায়ীভাবে মুছে ফেলা।
4. Delete করলে private email-ও database থেকে cascade-এ মুছে যাবে। Delete irreversible; আগে প্রয়োজনীয় backup নিন।
5. Guest email public API-তে নেই; moderation dashboard-এও email দেখানো হয় না।
6. Reply-ও approval-এর অপেক্ষায় থাকে। প্রথম স্তরের reply প্রদর্শন supported; গভীর nested thread editor হিসেবে নয়।

## ৫. Website announcement ও categories

Admin → Website & categories-এ English এবং বাংলা announcement লিখে Save করুন। খালি করে save করলে banner বন্ধ হবে। নতুন category-র English নাম ও বাংলা নাম দিয়ে Save category চাপুন। একই English নাম দিলে বাংলা label update হবে। পুরোনো portfolio-এর বিশদ experience/project data এখনো source-backed; CMS থেকে সেগুলোর সব field পরিবর্তন করার UI এই সংস্করণে নেই।

## ৬. Backup এবং recovery

- Content পরিবর্তনের আগে Admin → **Download content backup** চাপুন। JSON-এ articles, drafts, comments, categories এবং announcement থাকবে। Password, auth token এবং visitor email এতে নেই।
- Cover images-এর মূল copy নিজের কাছে রাখুন। Dashboard → Storage → article-images থেকে প্রয়োজনীয় ছবিও download করুন।
- পূর্ণ database/auth/private-email backup-এর জন্য owner-এর Supabase database export/`pg_dump` প্রয়োজন; Dashboard-এর Connect থেকে connection details নিন। এগুলো public chat বা repository-তে প্রকাশ করবেন না। Free plan-এ managed daily backup retention ধরে নেওয়া হয়নি।
- JSON restore-এর automatic public upload button রাখা হয়নি। ভুল restore যাতে বর্তমান data overwrite না করে, আগে backup review করতে হবে; agent দিয়ে ID এবং foreign key বজায় রেখে restore করান।
- Source rollback-এর baseline commit: `33466592c346f0fe2b21598e8cc59b9f210f8ee3`। Local branch `backup/pre-blog-2026-11-16` আছে; remote backup create 403 হওয়ায় হয়নি।
- Website rollback: GitHub commit history থেকে upgrade commit revert করুন। Database rollback আলাদা বিষয়; নতুন tables মুছলে blog/comments হারাবে। আগে export এবং review ছাড়া table drop করবেন না।
- Admin password হারালে Supabase project owner-এর Dashboard recovery ব্যবহার করুন। Website password আর Supabase project-owner account password আলাদা।

## ৭. Zero-cost সীমা

১৬ নভেম্বর ২০২৬-এ official sources যাচাই:

| সেবা | বিনামূল্যের বর্তমান সীমা / আচরণ |
|---|---|
| GitHub Pages, public repository | 1 GB published site; soft 100 GB/month bandwidth; custom domain প্রয়োজন নেই |
| Supabase Free | 500 MB database, 1 GB files, 5 GB egress + 5 GB cached egress, 50,000 monthly active users; 2 active projects |
| Supabase inactivity | ১ সপ্তাহ inactive থাকলে pause হতে পারে; Dashboard থেকে resume করতে হবে |
| Supabase API | Pricing page-এ unlimited API requests বলা আছে, কিন্তু database/compute/bandwidth সীমা বহাল |
| Supabase Edge | 500,000 invocation quota; Dashboard Usage এবং official Functions Pricing দেখে monitor করুন; unlimited নয় |
| GitHub Actions | Standard public-repository hosted runners বিনামূল্যে; schedule delay/disable হতে পারে |
| Google Fonts | ব্যবহারের জন্য subscription প্রয়োজন নেই; বাইরের font request হয় |
| Optional YouTube embeds | embed থাকলেই third-party connection হয়; কোনো paid API ব্যবহার করা হয়নি |

কোনো paid plan বা domain configure করা হয়নি। বিদ্যমান Supabase organization billing plan tool দিয়ে নিশ্চিত করা হয়নি; owner Dashboard → Billing-এ **Free** আছে যাচাই করবেন। সীমা ছাড়ালে core backend থামতে পারে; নিজে থেকে paid upgrade করার ব্যবস্থা নেই। Portfolio static অংশ তখনো থাকবে। ভারী video database storage-এ দেবেন না।

Spam controls: 16 KB request limit, honeypot, minimum form time, validation, সর্বোচ্চ ৮ engagement/১০ মিনিট প্রতি hashed connection identity, মোট ৬০/minute, ২০০ comment/day ও ২০০০ engagement/day। Shared network-এ অন্য visitor-ও একই rate bucket ভাগ করতে পারেন। IP header provenance live deployment-এ যাচাই করা বাকি; global caps header-নির্ভর নয়। Browser reaction dedup clearing storage/new browser দিয়ে reset হতে পারে; এটিকে ভোটের নিরাপদ নির্বাচনব্যবস্থা ভাববেন না।

Sources:
- https://supabase.com/pricing
- https://supabase.com/docs/guides/functions/pricing
- https://supabase.com/docs/guides/functions/limits
- https://supabase.com/docs/guides/auth/auth-smtp
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/billing/concepts/product-billing/github-actions

## ৮. পরিচিত সীমাবদ্ধতা ও বাকি কাজ

- Live deployment, production migration, Edge deployment এবং admin bootstrap বাকি।
- Desktop/mobile/tablet screenshots ও browser interaction পরীক্ষা access error-এর কারণে করা যায়নি।
- Login/logout/CRUD/moderation/reactions-এর real-service end-to-end tests বাকি; mock/unit tests দিয়ে এগুলো পুরোপুরি প্রমাণিত নয়।
- Scheduled articles-এর social metadata ও sitemap workflow deployment-এর পর update হয়; সময় exact নয়। Unpublish করলেও আগে তৈরি static copy পরবর্তী deployment পর্যন্ত থাকতে পারে। জরুরি সরাতে সঙ্গে সঙ্গে workflow চালাতে হবে। ইতিমধ্যে public হওয়া content-এর third-party cache প্রত্যাহার নিশ্চিত করা যায় না।
- নতুন article clean URL static export হওয়ার আগ পর্যন্ত GitHub 404 fallback দিয়ে reader-এ যায়। এ সময় crawler-এর HTTP status 404 থাকতে পারে; export হওয়ার পর real path 200 হবে।
- Blog search database-এর simple full-text index ব্যবহার করে; English/বাংলা শব্দ খোঁজা যায়, fuzzy/typo matching নয়। প্রতি request-এ ৯টি summary আসে; পুরো article collection download হয় না। Reading time আনুমানিক।
- Admin login page publicly reachable; dashboard data ও writes RLS দ্বারা private। Static GitHub Pages-এ HTTP-level private admin document hosting সম্ভব নয়।
- Bangla portfolio পুরোনো manual dictionary সংরক্ষণ করে; সব পুরোনো English string-এর translation coverage live UI audit করা বাকি। User-authored article কখনো নিজে অনুবাদ করা হয় না।
- Email notifications/subscriptions, advanced editor, full portfolio-field CMS এবং multi-level threaded replies করা হয়নি।
