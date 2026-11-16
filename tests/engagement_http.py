"""Safe HTTP smoke check: malformed reactions never alter production data."""
import json,re,urllib.request,urllib.error
from pathlib import Path
s=Path('js/config.js').read_text()
url=re.search(r"url:'([^']+)'",s)[1]+'/functions/v1/journal-engagement'
key=re.search(r"key:'([^']+)'",s)[1]
origin='https://shahin4l.github.io'
def send(method,body=None,extra=None):
 headers={'Origin':origin,'apikey':key}
 headers.update(extra or {})
 if body is not None: headers['Content-Type']='application/json'
 req=urllib.request.Request(url,data=None if body is None else json.dumps(body).encode(),headers=headers,method=method)
 try:r=urllib.request.urlopen(req,timeout=60)
 except urllib.error.HTTPError as e:r=e
 text=r.read().decode()
 print(method,r.status,'CORS:',r.headers.get('Access-Control-Allow-Origin'),'body:',text[:500])
 return r.status,r.headers,text
status,h,_=send('OPTIONS',extra={'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'apikey,content-type'})
assert status in (200,204),status
assert h.get('Access-Control-Allow-Origin')==origin
status,h,_=send('POST',{'kind':'like','post_id':'not-a-valid-id','visitor':'not-a-valid-id'})
assert status==400,status
assert h.get('Access-Control-Allow-Origin')==origin
print('Live preflight and validation passed.')
