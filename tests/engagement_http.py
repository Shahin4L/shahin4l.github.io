"""Read-only HTTP smoke checks. Invalid IDs prevent any production writes."""
import json,re,urllib.request,urllib.error
from pathlib import Path
config=Path('js/config.js').read_text()
url=re.search(r"url:'([^']+)'",config)[1]+'/functions/v1/journal-engagement'
origin='https://shahin4l.github.io'
def send(method,body=None,extra=None):
 headers={'Origin':origin}
 headers.update(extra or {})
 if body is not None: headers['Content-Type']='text/plain;charset=UTF-8'
 req=urllib.request.Request(url,data=None if body is None else json.dumps(body).encode(),headers=headers,method=method)
 try:r=urllib.request.urlopen(req,timeout=30)
 except urllib.error.HTTPError as e:r=e
 text=r.read().decode()
 allowed=r.headers.get_all('Access-Control-Allow-Origin',[])
 assert allowed==[origin],allowed
 print(method,r.status,'single origin header:',allowed,'body:',text[:150])
 return r.status,r.headers,text
status,h,_=send('POST',{'kind':'like','post_id':'invalid','visitor':'invalid'})
assert status==400,status
assert json.loads(_)['error']=='Invalid request'
status,h,_=send('OPTIONS',extra={'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'apikey,content-type,cache-control,pragma'})
assert status in (200,204),status
allowed={x.strip().lower() for x in h.get('Access-Control-Allow-Headers','').split(',')}
assert {'apikey','content-type','cache-control','pragma'}<=allowed,allowed
print('Live simple guest POST without API key and legacy preflight both passed. No data changed.')
