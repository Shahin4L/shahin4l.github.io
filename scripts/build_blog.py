#!/usr/bin/env python3
"""Export published articles to real GitHub Pages directories for crawler/social SEO.
Only the public publishable key is used. No drafts, comments, contacts or secrets.
Run after schema setup. A failed database request aborts before touching output.
"""
from pathlib import Path
import json, re, html, urllib.request, urllib.parse, datetime, shutil
ROOT=Path(__file__).resolve().parents[1]
config=(ROOT/'js/config.js').read_text()
URL=re.search(r"url:'([^']+)'",config)[1]
KEY=re.search(r"key:'([^']+)'",config)[1]
SITE='https://shahin4l.github.io'
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
posts=[]
while True:
 request=urllib.request.Request(URL+'/rest/v1/posts?select=*&status=eq.published&published_at=lte.'+urllib.parse.quote(now)+'&order=published_at.desc,id.asc&limit=1000&offset='+str(len(posts)),headers={'apikey':KEY})
 with urllib.request.urlopen(request,timeout=30) as response:
  batch=json.load(response)
 if not isinstance(batch,list): raise ValueError('Unexpected public API response')
 posts.extend(batch)
 if len(batch)<1000: break
if not isinstance(posts,list): raise ValueError('Unexpected public API response')
# Known column contract: fail rather than silently publishing broken pages.
for p in posts:
 if not re.fullmatch('[a-z0-9]+(-[a-z0-9]+)*',p['slug']): raise ValueError('Unsafe slug')
template=(ROOT/'blog/article.html').read_text()
def e(s): return html.escape(str(s or ''),quote=True)
def render(p,bn=False):
 title=p.get('title_bn') if bn and p.get('content_bn') else p['title']
 excerpt=p.get('excerpt_bn') if bn and p.get('content_bn') else p.get('excerpt','')
 seo_title=(p.get('seo_title_bn') if bn else p.get('seo_title')) or title
 seo_description=(p.get('seo_description_bn') if bn else p.get('seo_description')) or excerpt
 content=p.get('content_bn') if bn and p.get('content_bn') else p['content']
 language='bn' if bn and p.get('content_bn') else 'en'
 canonical=SITE+'/blog/'+p['slug']+('/bn/' if bn else '/')
 schema={'@context':'https://schema.org','@type':'BlogPosting','headline':title,'description':excerpt,'datePublished':p['published_at'],'dateModified':p['updated_at'],'inLanguage':language,'author':{'@type':'Person','name':'Md Shahin Alam','url':SITE},'mainEntityOfPage':canonical}
 # Escape </script> and arbitrary HTML in JSON-LD and fallback copy.
 metadata=f'<link rel="canonical" href="{e(canonical)}"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(excerpt)}"><meta property="og:url" content="{e(canonical)}"><meta property="og:type" content="article"><meta property="og:image" content="{e(p.get("cover_url") or SITE+"/profile.jpg")}"><script type="application/ld+json" id="article-schema">{json.dumps(schema,ensure_ascii=False).replace("<",chr(92)+"u003c")}</script>'
 if p.get('content_bn'):
  metadata+=f'<link rel="alternate" hreflang="en" href="{SITE}/blog/{p["slug"]}/"><link rel="alternate" hreflang="bn" href="{SITE}/blog/{p["slug"]}/bn/">'
 page=template.replace('<html lang="en">','<html lang="'+language+'">').replace('<title>Article | Md Shahin Alam</title>','<title>'+e(seo_title)+' | Md Shahin Alam</title>').replace('content="Operations and leadership journal by Md Shahin Alam."','content="'+e(seo_description)+'"').replace('</head>',metadata+'</head>')
 fallback='<h1>'+e(title)+'</h1><p>'+e(excerpt)+'</p><div style="white-space:pre-wrap">'+e(content)+'</div><noscript><p>Enable JavaScript to use article controls and comments.</p></noscript>'
 return page.replace('<p>Loading article / লেখা লোড হচ্ছে…</p>',fallback)
old_file=ROOT/'blog/generated-pages.json'
old=json.loads(old_file.read_text()) if old_file.exists() else []
current=[]
for p in posts:
 target=ROOT/'blog'/p['slug'];target.mkdir(exist_ok=True)
 (target/'index.html').write_text(render(p))
 current.append(p['slug'])
 if p.get('content_bn'):
  bn=target/'bn';bn.mkdir(exist_ok=True);(bn/'index.html').write_text(render(p,True))
 elif (target/'bn').exists(): shutil.rmtree(target/'bn')
for slug in old:
 if slug not in current and re.fullmatch('[a-z0-9]+(-[a-z0-9]+)*',slug):
  target=ROOT/'blog'/slug
  if (target/'index.html').exists(): shutil.rmtree(target)
old_file.write_text(json.dumps(current,indent=2))
urls=[SITE+'/',SITE+'/blog/',SITE+'/blog/privacy.html',SITE+'/formula-lab/',SITE+'/formula-lab/practice/']
for p in posts:
 urls.append(SITE+'/blog/'+p['slug']+'/')
 if p.get('content_bn'): urls.append(SITE+'/blog/'+p['slug']+'/bn/')
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+e(u)+'</loc></url>' for u in urls)+'</urlset>\n')
print('Exported',len(posts),'published articles; sitemap updated.')
