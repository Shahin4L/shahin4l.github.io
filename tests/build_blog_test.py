import unittest, tempfile, shutil, json, runpy, io
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
class ExportTests(unittest.TestCase):
 def test_metadata_bilingual_pages_and_unpublish_cleanup(self):
  with tempfile.TemporaryDirectory() as tmp:
   r=Path(tmp)
   for d in ['scripts','js','blog']:(r/d).mkdir()
   for file in ['scripts/build_blog.py','js/config.js','blog/article.html']:shutil.copy(ROOT/file,r/file)
   p={'id':'test','slug':'test-story','title':'A <safe> title','title_bn':'বাংলা শিরোনাম','content':'## Test\n<script>unsafe</script>','content_bn':'বাংলা লেখা','excerpt':'English summary','excerpt_bn':'বাংলা সারসংক্ষেপ','published_at':'2026-11-16T00:00:00Z','updated_at':'2026-11-16T00:00:00Z'}
   with patch('urllib.request.urlopen',return_value=io.BytesIO(json.dumps([p]).encode())):runpy.run_path(str(r/'scripts/build_blog.py'))
   en=(r/'blog/test-story/index.html').read_text();bn=(r/'blog/test-story/bn/index.html').read_text()
   self.assertIn('A &lt;safe&gt; title',en);self.assertNotIn('<script>unsafe</script>',en);self.assertIn('hreflang="bn"',en);self.assertIn('<html lang="bn">',bn);self.assertIn('বাংলা শিরোনাম',bn);self.assertIn('/blog/test-story/bn/',(r/'sitemap.xml').read_text())
   with patch('urllib.request.urlopen',return_value=io.BytesIO(b'[]')):runpy.run_path(str(r/'scripts/build_blog.py'))
   self.assertFalse((r/'blog/test-story').exists())
 def test_failed_api_does_not_delete_existing_pages(self):
  with tempfile.TemporaryDirectory() as tmp:
   r=Path(tmp)
   for d in ['scripts','js','blog']:(r/d).mkdir()
   for file in ['scripts/build_blog.py','js/config.js','blog/article.html']:shutil.copy(ROOT/file,r/file)
   (r/'blog/generated-pages.json').write_text('["existing"]');(r/'blog/existing').mkdir();(r/'blog/existing/index.html').write_text('keep me')
   with patch('urllib.request.urlopen',side_effect=OSError('Offline')):
    with self.assertRaises(OSError):runpy.run_path(str(r/'scripts/build_blog.py'))
   self.assertEqual((r/'blog/existing/index.html').read_text(),'keep me')
if __name__=='__main__':unittest.main()
