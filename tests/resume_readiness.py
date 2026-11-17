"""Read-only readiness checks. No accounts are created and no emails are sent."""
import json,re,urllib.request,urllib.error
from pathlib import Path
config=Path('js/config.js').read_text();url=re.search(r"url:'([^']+)'",config)[1];key=re.search(r"key:'([^']+)'",config)[1]
request=urllib.request.Request(url+'/auth/v1/settings',headers={'apikey':key})
with urllib.request.urlopen(request,timeout=25) as response:settings=json.load(response)
print('Auth settings reachable. Email provider available:',settings.get('external',{}).get('email'),'Signup disabled:',settings.get('disable_signup'),'Auto confirmation:',settings.get('mailer_autoconfirm'))
request=urllib.request.Request(url+'/rest/v1/cv_workspaces?select=user_id&limit=1',headers={'apikey':key})
try:
 with urllib.request.urlopen(request,timeout=25) as response:
  result=json.load(response)
  assert result==[], 'Anonymous users must not see CVs'
  print('Anonymous cloud CV visibility: no rows.')
except urllib.error.HTTPError as error:
 assert error.code in (401,403),error.code
 print('Anonymous cloud CV access denied as expected:',error.code)
