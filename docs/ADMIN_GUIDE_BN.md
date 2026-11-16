# Portfolio + Journal — বাংলা ব্যবহার নির্দেশিকা

ওয়েবসাইট: https://shahin4l.github.io/
ব্লগ: https://shahin4l.github.io/blog/
এডিটর: https://shahin4l.github.io/admin/

## নতুন লেখা প্রকাশ

1. Editor খুলে নিজের email/password দিয়ে Sign in করুন। Password কাউকে পাঠাবেন না।
2. **+ New article / + নতুন লেখা** চাপুন।
3. English title, summary এবং content লিখুন। বাংলা সংস্করণের জন্য বাংলা title, summary এবং content আলাদাভাবে লিখুন। কোনো লেখা স্বয়ংক্রিয় অনুবাদ করা হয় না।
4. URL slug ছোট ইংরেজি অক্ষর ও হাইফেন দিয়ে লিখুন: `building-better-operations`। প্রকাশের পর slug অপরিবর্তিত রাখলে পুরোনো link ঠিক থাকবে।
5. Category বাছুন এবং comma দিয়ে tags লিখুন। বাংলা tag-ও দেওয়া যায়।
6. Cover image upload করুন: JPEG/PNG/WebP, সর্বোচ্চ 2 MB। অথবা নিজের HTTPS image link দিন।
7. প্রয়োজন হলে English এবং বাংলা SEO title/description দিন।
8. **Preview** দেখে Status **Draft** রেখে Save করলে লেখা খসড়া থাকবে।
9. প্রকাশ করতে Status **Published** নির্বাচন করে **Save article** চাপুন।
10. Publish time খালি থাকলে বর্তমান সময় ব্যবহার হয়। ভবিষ্যতের সময় দিলে তার আগে public listing-এ লেখা দেখা যায় না।
11. **Featured** নির্বাচন করলে নির্বাচিত লেখায় দেখাবে। **Comments enabled** বন্ধ করলে নতুন মন্তব্য নেওয়া বন্ধ হবে।

এই সংস্করণে English title ও English content required। বাংলা-only লেখার জন্য সংক্ষিপ্ত English version দিয়ে পূর্ণ বাংলা content আলাদা ঘরে লিখতে পারেন।

## লেখার format

```markdown
## একটি শিরোনাম

সাধারণ paragraph, **বোল্ড** ও *ইটালিক*।

- একটি বিষয়
- আরেকটি বিষয়

[লিংকের নাম](https://example.com)

![ছবির caption](https://example.com/image.jpg)

> উদ্ধৃতি

| বিষয় | ফলাফল |
| --- | --- |
| দক্ষতা | উন্নত |
```

Code block-এর আগে ও পরে তিনটি backtick দিন। YouTube video-এর জন্য আলাদা লাইনে `@[youtube](https://www.youtube.com/watch?v=VIDEO_ID)` লিখুন; VIDEO_ID আসল ১১ অক্ষরের video ID। অন্য arbitrary HTML/iframe চালানো হয় না। এটি সীমিত Markdown editor, পূর্ণ Word editor নয়।

## মন্তব্য যাচাই

1. Editor → **Moderation / মন্তব্য অনুমোদন** খুলুন।
2. **Pending** নির্বাচন করে নাম, লেখা ও article মিলিয়ে পড়ুন।
3. **Approve** = প্রকাশ; **Reject** = গোপন রেখে প্রত্যাখ্যান; **Spam** = spam হিসেবে চিহ্নিত।
4. **Delete** স্থায়ীভাবে মুছে দেয়—আগে প্রয়োজনীয় backup রাখুন।
5. Visitor-এর email প্রকাশিত হয় না। Reply-ও অনুমোদনের অপেক্ষায় থাকে।
6. কোনো লেখায় নতুন মন্তব্য বন্ধ করতে article editor থেকে **Comments enabled** বন্ধ করুন।

## Announcement ও category

**Website & categories**-এ দুই ভাষায় announcement লিখে Save করুন। খালি করে save করলে banner বন্ধ হবে। নতুন category-এর English ও বাংলা নাম দিন। একই English নাম দিলে বাংলা label update হবে।

পুরোনো portfolio-এর বিশদ experience/project fields এখনো source-backed; এই CMS থেকে সব portfolio field edit করা যায় না।

## Backup ও recovery

- বড় পরিবর্তনের আগে **Download content backup** চাপুন। JSON backup নিজের কাছে রাখুন।
- ছবির original copy আলাদাভাবে রাখুন। Content backup ছবির file bytes অন্তর্ভুক্ত করে না।
- এই backup content-এর জন্য; সম্পূর্ণ account/service backup নয়। পূর্ণ backup ও restore নিজের service Dashboard থেকে review করে করতে হবে।
- Restore প্রয়োজন হলে আগে বর্তমান backup নিন; ভুল restore data overwrite করতে পারে।
- Password ভুলে গেলে **Forgot password** ব্যবহার করুন। Email না এলে নিজের Supabase Dashboard থেকে account recovery করুন।
- Password reset-এর redirect ঠিক করতে নিজের Supabase Dashboard → Authentication → URL Configuration-এ Site URL `https://shahin4l.github.io` এবং allowed redirect `https://shahin4l.github.io/admin/` review করুন। নিজের account settings কাউকে প্রকাশ করবেন না।

## Article link, SEO ও publishing delay

Public listing database publication অনুযায়ী update হয়। Clean article pages, social metadata ও sitemap পরবর্তী successful hourly publishing workflow-এ তৈরি হয়। Schedule কিছুটা দেরি করতে পারে। দ্রুত refresh করতে repository → Actions → **Publish portfolio and journal** → **Run workflow** ব্যবহার করুন।

Unpublish/Delete-এর পর আগে তৈরি static copy সরাতেও workflow refresh প্রয়োজন। আগে public হওয়া তথ্যের বাইরের cache সঙ্গে সঙ্গে মুছে ফেলার নিশ্চয়তা নেই। গোপন তথ্য public article-এ দেবেন না।

## বিনামূল্যের ব্যবহার ও সীমা

কোনো paid domain বা mandatory subscription প্রয়োজন নেই। GitHub Pages এবং Supabase Free-এর quota ও inactivity pause প্রযোজ্য; Dashboard-এর Usage নিয়মিত দেখুন। বড় video storage-এ দেবেন না। কোনো service বন্ধ/pause হলে static portfolio চলতে পারে, কিন্তু blog interaction সাময়িকভাবে বন্ধ হতে পারে।

বর্তমান limits যাচাইয়ের official links:
- https://supabase.com/pricing
- https://supabase.com/docs/guides/functions/pricing
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Native sharing device support-এর ওপর নির্ভর করে। Reaction browser storage clear করলে reset হতে পারে। Full portfolio CMS, subscriptions/email notifications এবং গভীর nested discussion এই সংস্করণের অংশ নয়।
