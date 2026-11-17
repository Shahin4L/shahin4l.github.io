import unittest,sys,datetime as dt,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import update_industry_news as news
NOW=dt.datetime(2026,11,17,4,tzinfo=dt.timezone.utc)
SOURCE=news.SOURCES[0]
def rss(items):
 return ('<rss version="2.0"><channel>'+''.join('<item><title>'+title+'</title><link>'+url+'</link><pubDate>'+date+'</pubDate><description>Never copy the full article</description></item>' for title,url,date in items)+'</channel></rss>').encode()
DATE='Tue, 17 Nov 2026 03:00:00 +0000'
URL='https://www.supplychaindive.com/news/test/123/'
def fixture():
 return news.parse_feed(rss([('A useful headline',URL,DATE)]),SOURCE,NOW)[0]
def results(ok=True,articles=None):
 return {s['id']:{'ok':ok,'articles':(articles or []) if s['id']==SOURCE['id'] else [],'error':'feed_unavailable'} for s in news.SOURCES}
class RadarTests(unittest.TestCase):
 def test_rss_metadata_and_dedup(self):
  parsed=news.parse_feed(rss([('A &amp; B',URL+'?utm_source=mail',DATE),('Duplicate',URL+'#fragment',DATE)]),SOURCE,NOW)
  self.assertEqual(len(parsed),1);self.assertEqual(parsed[0]['title'],'A & B')
  self.assertEqual(parsed[0]['url'],'https://supplychaindive.com/news/test/123/');self.assertNotIn('description',parsed[0]);self.assertNotIn('content',parsed[0])
 def test_atom_uses_original_published_date(self):
  atom=b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Atom story</title><link rel="alternate" href="https://spectrum.ieee.org/story"/><published>2026-11-16T10:00:00Z</published><updated>2026-11-17T03:00:00Z</updated></entry></feed>'
  result=news.parse_feed(atom,news.SOURCES[1],NOW)
  self.assertEqual(result[0]['published_at'],'2026-11-16T10:00:00Z');self.assertEqual(result[0]['date_kind'],'published')
 def test_updated_date_is_labelled_and_missing_dates_are_not_invented(self):
  atom=b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Atom story</title><link href="https://spectrum.ieee.org/story"/><updated>2026-11-17T03:00:00Z</updated></entry></feed>'
  self.assertEqual(news.parse_feed(atom,news.SOURCES[1],NOW)[0]['date_kind'],'updated')
  self.assertEqual(news.parse_feed(rss([('No date',URL,'bad date')]),SOURCE,NOW),[])
 def test_old_future_and_unsafe_links_are_ignored(self):
  self.assertEqual(news.parse_feed(rss([('Old',URL,'Wed, 01 Jan 2020 00:00:00 +0000'),('Future',URL,'Wed, 01 Jan 2031 00:00:00 +0000'),('Unsafe','javascript:alert(1)',DATE),('Other','https://attacker.test/story',DATE)]),SOURCE,NOW),[])
  self.assertIsNone(news.safe_url('https://user:pass@www.supplychaindive.com/a',SOURCE))
  self.assertIsNone(news.safe_url('https://www.supplychaindive.com:8443/a',SOURCE))
 def test_dtd_oversized_and_html_rejected(self):
  for raw in [b'<!DOCTYPE rss [<!ENTITY x "abc">]><rss/>',b'x'*(news.MAX_BYTES+1),b'<html>not a feed</html>']:
   with self.assertRaises((ValueError,news.ET.ParseError)):news.parse_feed(raw,SOURCE,NOW)
 def test_complete_partial_failed_and_first_seen(self):
  first=news.aggregate({},results(True,[fixture()]),NOW);self.assertEqual(first['status'],'complete');self.assertEqual(first['new_count'],1)
  next_time=NOW+dt.timedelta(hours=2)
  second=news.aggregate(first,results(True,[fixture()]),next_time);self.assertEqual(second['new_count'],0);self.assertEqual(second['articles'][0]['first_seen_at'],news.stamp(NOW))
  failed=news.aggregate(first,results(False),next_time);self.assertEqual(failed['status'],'failed');self.assertEqual(failed['articles'],first['articles']);self.assertEqual(failed['last_success_at'],first['last_success_at'])
  partial_results=results(False);partial_results[SOURCE['id']]={'ok':True,'articles':[fixture()]}
  partial=news.aggregate(first,partial_results,next_time);self.assertEqual(partial['status'],'partial')
 def test_expired_items_disappear_even_when_source_fails(self):
  previous=news.aggregate({},results(True,[fixture()]),NOW)
  late=news.aggregate(previous,results(False),NOW+dt.timedelta(days=31));self.assertEqual(late['articles'],[])
 def test_daily_dhaka_schedule_and_retry(self):
  today={'checked_at':news.stamp(NOW),'status':'complete'}
  self.assertFalse(news.should_check(today,NOW+dt.timedelta(hours=1)))
  self.assertTrue(news.should_check(today,NOW+dt.timedelta(days=1)))
  yesterday={'checked_at':news.stamp(NOW-dt.timedelta(days=1)),'status':'complete'}
  self.assertFalse(news.should_check(yesterday,dt.datetime(2026,11,17,2,tzinfo=dt.timezone.utc)))
  morning={'checked_at':'2026-11-17T00:00:00Z','status':'complete'}
  self.assertTrue(news.should_check(morning,NOW))
  failed={**today,'status':'failed'}
  self.assertFalse(news.should_check(failed,NOW+dt.timedelta(hours=5)))
  self.assertTrue(news.should_check(failed,NOW+dt.timedelta(hours=6)))
  self.assertTrue(news.should_check(today,NOW,True))
 def test_snapshot_is_bounded_and_uses_only_approved_sources(self):
  initial=news.aggregate({},results(True,[fixture()]),NOW)
  self.assertLessEqual(len(initial['articles']),40)
  self.assertEqual(len(initial['sources']),4)
  for source in initial['sources']:self.assertTrue(source['feed'].startswith('https://'))
if __name__=='__main__':unittest.main()
