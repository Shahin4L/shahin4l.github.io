#!/usr/bin/env python3
"""Collect public publisher RSS/Atom metadata. Never copy article bodies or bypass paywalls."""
import argparse,os,concurrent.futures,datetime as dt,email.utils,html,json,re,urllib.request,urllib.error,urllib.parse,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from zoneinfo import ZoneInfo
UTC=dt.timezone.utc
SOURCES=[
 {'id':'supply-chain-dive','name':'Supply Chain Dive','feed':'https://www.supplychaindive.com/feeds/news/','url':'https://www.supplychaindive.com/','hosts':['supplychaindive.com','www.supplychaindive.com'],'topic':'supply-chain'},
 {'id':'ieee-spectrum','name':'IEEE Spectrum','feed':'https://spectrum.ieee.org/feeds/feed.rss','url':'https://spectrum.ieee.org/','hosts':['spectrum.ieee.org'],'topic':'engineering'},
 {'id':'lean-enterprise','name':'Lean Enterprise Institute','feed':'https://www.lean.org/feed/','url':'https://www.lean.org/the-lean-post/','hosts':['lean.org','www.lean.org'],'topic':'operations'},
 {'id':'mit-ctl','name':'MIT Center for Transportation & Logistics','feed':'https://ctl.mit.edu/rss.xml','url':'https://ctl.mit.edu/news','hosts':['ctl.mit.edu'],'topic':'supply-chain'}
]
MAX_BYTES=2_000_000
MAX_AGE=dt.timedelta(days=30)
class Text(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.parts=[]
 def handle_data(self,data):self.parts.append(data)
def plain(value):
 p=Text();p.feed(value or '');return re.sub(r'\s+',' ',html.unescape(' '.join(p.parts))).strip()
def stamp(now):return now.astimezone(UTC).isoformat().replace('+00:00','Z')
def parse_date(value):
 if not value:return None
 try: d=email.utils.parsedate_to_datetime(value)
 except (ValueError,TypeError,IndexError):
  try:d=dt.datetime.fromisoformat(value.strip().replace('Z','+00:00'))
  except (ValueError,TypeError):return None
 return d.astimezone(UTC) if d.tzinfo else None
def safe_url(value,source):
 try:
  u=urllib.parse.urlsplit(value.strip())
  if u.scheme!='https' or u.hostname not in source['hosts'] or u.username or u.password or u.port not in (None,443):return None
  query=urllib.parse.parse_qsl(u.query,keep_blank_values=True)
  query=[(k,v) for k,v in query if not k.lower().startswith('utm_') and k.lower() not in ('fbclid','gclid','mc_cid','mc_eid')]
  host=u.hostname.removeprefix('www.')
  return urllib.parse.urlunsplit(('https',host,u.path or '/',urllib.parse.urlencode(sorted(query)),''))
 except (ValueError,AttributeError):return None
def topic_for(title,source):
 if re.search(r'procure|sourcing|supplier|purchasing',title,re.I):return 'procurement'
 if re.search(r'logistic|freight|shipping|warehouse|delivery|trucking|cargo|ports?\b',title,re.I):return 'logistics'
 if re.search(r'six sigma|quality control|defect',title,re.I):return 'quality'
 return source['topic']
def local(tag):return tag.rsplit('}',1)[-1]
def field(entry,names):
 for name in names:
  for child in entry:
   if local(child.tag)==name:return ''.join(child.itertext()).strip()
 return ''
def parse_feed(raw,source,now):
 if len(raw)>MAX_BYTES or b'<!DOCTYPE' in raw.upper() or b'<!ENTITY' in raw.upper():raise ValueError('Unsafe or oversized XML')
 root=ET.fromstring(raw)
 if local(root.tag) not in ('rss','feed','RDF'):raise ValueError('Not an RSS or Atom feed')
 articles={}
 for entry in root.iter():
  if local(entry.tag) not in ('item','entry'):continue
  title=plain(field(entry,['title']))[:240]
  link=field(entry,['link'])
  if local(entry.tag)=='entry':
   links=[c for c in entry if local(c.tag)=='link' and c.attrib.get('rel','alternate')=='alternate']
   link=next((c.attrib.get('href','') for c in links if c.attrib.get('type','text/html')=='text/html'),'')
  url=safe_url(link,source)
  date=field(entry,['pubDate','published','date']);kind='published'
  if not date:date=field(entry,['updated']);kind='updated'
  published=parse_date(date)
  if not title or not url or not published or published>now+dt.timedelta(hours=1) or now-published>MAX_AGE:continue
  article={'title':title,'url':url,'published_at':stamp(published),'date_kind':kind,'source_id':source['id'],'source':source['name'],'topic':topic_for(title,source)}
  articles.setdefault(url,article)
 return sorted(articles.values(),key=lambda a:parse_date(a['published_at']),reverse=True)[:8]
class SafeRedirect(urllib.request.HTTPRedirectHandler):
 def __init__(self,source):super().__init__();self.source=source
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  if not safe_url(newurl,self.source):raise ValueError('Unapproved redirect')
  return super().redirect_request(req,fp,code,msg,headers,newurl)
def fetch_source(source,now):
 request=urllib.request.Request(source['feed'],headers={'User-Agent':'ShahinIndustryRadar/1.0 (+https://shahin4l.github.io/blog/)','Accept':'application/rss+xml,application/atom+xml,application/xml,text/xml','Accept-Encoding':'identity'})
 with urllib.request.build_opener(SafeRedirect(source)).open(request,timeout=18) as response:
  raw=response.read(MAX_BYTES+1)
 return parse_feed(raw,source,now)
def should_check(previous,now,force=False):
 if force or not previous.get('checked_at'):return True
 last=parse_date(previous.get('checked_at'))
 if not last:return True
 local_now=now.astimezone(ZoneInfo('Asia/Dhaka'))
 last_local=last.astimezone(ZoneInfo('Asia/Dhaka'))
 if last_local.date()!=local_now.date():return local_now.hour>=9
 if last_local.hour<9<=local_now.hour:return True
 return previous.get('status')!='complete' and now-last>=dt.timedelta(hours=6)
def aggregate(previous,results,now,sources=SOURCES):
 at=stamp(now);old_articles=previous.get('articles',[])
 old_by_url={a['url']:a for a in old_articles}
 old_sources={s['id']:s for s in previous.get('sources',[])}
 articles=[];states=[];ok=0
 for source in sources:
  result=results[source['id']];success=result['ok'];ok+=int(success)
  state={k:source[k] for k in ('id','name','url','feed')}
  state.update({'checked_at':at,'status':'success' if success else 'failed','last_success_at':at if success else old_sources.get(source['id'],{}).get('last_success_at'),'error':None if success else result['error']})
  entries=result['articles'] if success else []
  # Successful empty feeds are valid; retain recent references without labelling them new.
  combined={a['url']:a for a in old_articles if a.get('source_id')==source['id']}
  for a in entries:
   a=dict(a);a['first_seen_at']=old_by_url.get(a['url'],{}).get('first_seen_at',at);combined[a['url']]=a
  recent=[]
  for a in combined.values():
   date=parse_date(a.get('published_at'))
   if date and dt.timedelta(hours=-1)<=now-date<=MAX_AGE:recent.append(a)
  recent.sort(key=lambda a:parse_date(a['published_at']),reverse=True)
  state['article_count']=len(recent[:8]);articles.extend(recent[:8]);states.append(state)
 articles=sorted({a['url']:a for a in articles}.values(),key=lambda a:parse_date(a['published_at']),reverse=True)[:40]
 new_count=sum(a['url'] not in old_by_url for a in articles)
 return {'version':1,'checked_at':at,'last_success_at':at if ok else previous.get('last_success_at'),'last_changed_at':at if new_count else previous.get('last_changed_at'),'status':'complete' if ok==len(sources) else 'partial' if ok else 'failed','new_count':new_count,'articles':articles,'sources':states}
def collect(previous,now,fetcher=fetch_source):
 results={}
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  futures={pool.submit(fetcher,s,now):s for s in SOURCES}
  for future in concurrent.futures.as_completed(futures):
   source=futures[future]
   try:results[source['id']]={'ok':True,'articles':future.result()}
   except urllib.error.HTTPError as error:results[source['id']]={'ok':False,'error':'http_'+str(error.code),'articles':[]}
   except Exception:results[source['id']]={'ok':False,'error':'feed_unavailable','articles':[]}
 return aggregate(previous,results,now)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--force',action='store_true');parser.add_argument('--output',default=str(Path(__file__).resolve().parents[1]/'blog/industry-news.json'));args=parser.parse_args()
 path=Path(args.output);previous=json.loads(path.read_text()) if path.exists() else {}
 now=dt.datetime.now(UTC)
 if not should_check(previous,now,args.force or os.environ.get('GITHUB_EVENT_NAME')=='workflow_dispatch'):print('Industry radar: daily check already completed, or before 09:00 Asia/Dhaka.');return
 result=collect(previous,now)
 path.parent.mkdir(parents=True,exist_ok=True);temporary=path.with_suffix('.tmp');temporary.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');temporary.replace(path)
 print('Industry radar:',result['status'],'articles:',len(result['articles']),'new:',result['new_count'])
 for source in result['sources']:print(source['id'],source['status'],source['article_count'],source['error'] or '')
if __name__=='__main__':main()
