# Resume Builder — মালিক ও ব্যবহারকারীর নির্দেশিকা

## কী ব্যবহার করা যাবে

ওয়েবসাইট: https://shahin4l.github.io/resume-builder/

১. Target & region ধাপে দেশ ও লক্ষ্য পদ দিন।
২. Contact, Summary, Experience, Education, Skills & projects ধাপে নিজের তথ্য লিখুন।
৩. প্রতিটি অভিজ্ঞতা/প্রকল্পে প্রতি লাইনে একটি বুলেট দিন। শুধু সত্য অর্জন ও যাচাইযোগ্য সংখ্যা ব্যবহার করুন।
৪. সর্বশেষ অভিজ্ঞতা ওপরে রাখুন; Move up/down দিয়ে ক্রম বদলাতে পারবেন।
৫. Review & export-এ Classic, Executive, Editorial বা Compact বাছুন।
৬. PDF / Print চাপুন → Destination থেকে Save as PDF → browser headers/footers বন্ধ করুন → preview মিলিয়ে Save করুন।
৭. Download backup দিয়ে JSON রাখুন। পরে Import backup দিয়ে আবার সম্পাদনা করুন।
৮. Download plain text দিয়ে টেক্সট ও পড়ার ক্রম পরীক্ষা করুন।

এটি browser print-to-PDF ব্যবহার করে; সরাসরি এক ক্লিকে PDF ফাইল ডাউনলোড নয়। PDF কোনো সার্ভারে আপলোড হয় না। সব ATS বা চাকরিতে সফলতার নিশ্চয়তা দেওয়া হয় না। ইউরোপে Europass নির্দিষ্টভাবে চাইলে https://europass.europa.eu/en/create-europass-cv ব্যবহার করুন; এই টুল অফিশিয়াল Europass তৈরি করে না।

## ব্যক্তিগত ডেটা কোথায় থাকে

অ্যাকাউন্ট ছাড়া খসড়া খোলা ট্যাবের মেমোরিতে থাকে। “Remember this draft” নিজে নির্বাচন করলে এই ব্রাউজারে থাকবে; সর্বশেষ সম্পাদনার ৯০ দিন পর পরবর্তী ভিজিটে ডিভাইসের পুরোনো খসড়া সরানো হয়। ডাউনলোড করা JSON/TXT/PDF আপনার নিজের নিয়ন্ত্রণে; সাইট সেগুলো মুছতে পারে না। শেয়ার করা কম্পিউটারে স্থানীয় খসড়া রাখবেন না।

Resume Builder-এর login session, editor/admin session থেকে আলাদা sessionStorage key ব্যবহার করে। একই Supabase project-এর পরিচয় সেবা ব্যবহার করা হয়; এটি আলাদা Supabase project নয়। CV ব্যবহারকারী অ্যাডমিন ক্ষমতা পান না।

Cloud Save স্পষ্টভাবে চাপলে public.cv_workspaces-এ নিজের user_id-এর অধীনে JSON সেভ হয়। PDF, ছবি বা attachment স্টোর করা হয় না। এক অ্যাকাউন্টে একটি cloud draft, সর্বোচ্চ 150 KB। নিজের CV-ই পড়া/বদলানো যায়।

## বর্তমান retention — গুরুত্বপূর্ণ সীমা

বর্তমান ডেটাবেসে workspace তৈরির পর **২ ক্যালেন্ডার মাস** সম্পাদনা এবং **৩ ক্যালেন্ডার মাস** পর cloud CV ও সংশ্লিষ্ট AI usage মুছে দেওয়ার কাজ আছে। ২–৩ মাসের মধ্যে সংরক্ষিত CV পড়া/ব্যাকআপ নেওয়া সম্ভব হতে পারে; নতুন সম্পাদনা করা যায় না।

**Supabase Auth-এর লগইন পরিচয়, ইমেইল ও provider-controlled logs এই বিদ্যমান CV cleanup মুছে দেয় না।** অ্যাকাউন্ট তৈরির দিন থেকে কঠোর ৬০/৯০ দিনের নতুন account-deletion পরিবর্তনের অনুরোধটি বাতিল হয়েছে; সেটি প্রয়োগ করা হয়নি। সম্পূর্ণ account-deletion policy আলাদা করে অনুমোদন ও পরীক্ষা করতে হবে। এটিকে ইতিমধ্যে চালু বলা যাবে না। বিদ্যমান portfolio admin পরিচয় কোনো CV cleanup দিয়ে মোছা উচিত নয়।

## সাধারণ ব্যবহারকারীর ইমেইল login/confirmation চালু করা

১. https://supabase.com/dashboard/project/gckaucdwkyhmctfnimbb/auth/users খুলুন।
২. Authentication → Sign In / Providers → Email-এ email signup চালু আছে কি না দেখুন। email confirmation বন্ধ করে নিরাপত্তা কমাবেন না।
৩. Authentication → URL Configuration → Redirect URLs-এ https://shahin4l.github.io/resume-builder/ যোগ করুন। বিদ্যমান homepage/admin URL মুছবেন না।
৪. Authentication → Email / SMTP Settings → Custom SMTP খুলুন। আপনার নিজের ইমেইল প্রদানকারীর SMTP host, port, username, app-password এবং sender দিন। আসল ইমেইল password বা private key এখানে চ্যাটে/GitHub-এ দেবেন না।
৫. Supabase-এর default email service সাধারণ public signup-এর নির্ভরযোগ্য production delivery নয়; custom SMTP প্রয়োজন হতে পারে। বিনামূল্যের ইমেইল প্রদানকারী ব্যবহার করা যায়, তবে তাদের সীমা আছে। Gmail app password সব Google account-এ পাওয়া যায় না; 2-Step Verification লাগে।
৬. নতুন সাধারণ ব্যবহারকারী দিয়ে Sign up → confirmation email → sign in → Cloud save → sign out → sign in → Load cloud draft → password recovery নিজে পরীক্ষা করুন। এই যাচাই না হওয়া পর্যন্ত public email delivery পরীক্ষিত বলে ধরা যাবে না।

অফিশিয়াল নির্দেশনা:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://support.google.com/accounts/answer/185833

## বাস্তব AI enhancement চালু করা

**এই release-এ provider key দেওয়া হয়নি; AI প্রস্তুত/সফল বলে দাবি করা হয়নি।** Backend source আছে supabase/functions/resume-assistant/index.ts-এ। Endpoint deploy ও provider setup বাকি থাকলে UI পরিষ্কারভাবে setup pending দেখাবে।

১. https://aistudio.google.com/api-keys খুলুন। নিজের Google account-এ ঢুকে free-tier project-এ key তৈরি করুন। বাধ্যতামূলক paid billing চালু করবেন না।
২. https://ai.google.dev/gemini-api/docs/pricing থেকে বর্তমানে free-tier-এ থাকা model ID নিন; মডেল/ফ্রি quota পরিবর্তিত হতে পারে।
৩. Supabase Dashboard → Edge Functions → Secrets খুলুন।
৪. CV_AI_KEY নামে নিজের key এবং CV_AI_MODEL নামে free-tier model ID রাখুন। Secret চ্যাট বা repository-তে দেবেন না।
৫. Key প্রস্তুত হলে আমাকে জানান; repository-র প্রস্তুত resume-assistant function deploy ও live পরীক্ষা করা যাবে। বিকল্পভাবে Supabase Edge Functions-এর editor দিয়ে প্রস্তুত source deploy করা যায়, তবে নিজে কোড লেখার দরকার নেই।
৬. একবার লগইন ও cloud CV save করে AI processing consent দিন। Summary বা bullet-এর AI review চাপুন। প্রস্তাব ভালো করে মিলিয়ে Apply reviewed text দিন।

AI-তে contact form-এর email/phone বা পুরো CV স্বয়ংক্রিয়ভাবে পাঠানো হয় না; নির্বাচিত পেশাগত লেখা ও লক্ষ্য পদ পাঠানো হয়। নির্বাচিত লেখায় ব্যক্তিগত তথ্য থাকলে তা প্রদানকারীর কাছে যাবে। Google free-tier input পণ্য উন্নয়নে ব্যবহার করতে পারে; consent ছাড়া পাঠানো হয় না। AI নতুন সংখ্যা যোগ করলে প্রস্তাব আটকে দেওয়া হয়, তবে প্রতিটি তথ্য মানুষকে যাচাই করতে হবে। বিদ্যমান quota function ব্যবহারকারীপ্রতি দৈনিক ১০টি অনুরোধ সীমিত করে। Provider quota শেষ হলে manual editing/PDF চলবে।

## বিনামূল্যের সীমা ও backup

GitHub Pages ও browser editing-এর জন্য নতুন server বা subscription দরকার নেই। Cloud CV বর্তমান Supabase Free quota ভাগ করে ব্যবহার করে; এটি unlimited নয়। Email ও AI provider-এর নিজস্ব free quota আছে। কোনো paid upgrade-এর ওপর manual editing/PDF নির্ভর করে না।

নিজের JSON backup নিয়মিত রাখুন। Cloud Delete irreversible; UI আগে সতর্ক করে। Repository history থেকে builder code rollback করা যায়; user backup ছাড়া মুছে ফেলা CV ফিরবে না। Provider logs/backups-এর মেয়াদ সাইটের application cleanup থেকে আলাদা।

## যাচাইয়ের অবস্থা

Model/schema allowlist, malicious HTML/URL escaping, চারটি layout-এর logical reading order, plaintext export, keyword comparison, calendar expiry, আলাদা auth storage/refresh/logout race, cloud save response, AI consent/privacy/number guard এবং public API readiness-এর automated tests দেওয়া আছে।

ব্রাউজারে visual layout, real PDF extraction, real email confirmation/password recovery, real multi-user cloud sessions এবং configured real AI provider response যাচাই না হলে সেগুলোকে tested বলা যাবে না।
