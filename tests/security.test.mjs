import test from 'node:test';import assert from 'node:assert/strict';
globalThis.localStorage={getItem(){return 'en'},setItem(){}};
const {markdown,safeURL,esc}=await import('../js/core.js');
test('untrusted HTML and scripts stay escaped',()=>{const out=markdown('<script>alert(1)</script>\n<img src=x onerror=alert(1)>');assert(!out.includes('<script>'));assert(!out.includes('<img src=x'));assert(out.includes('&lt;script&gt;'))});
test('javascript links and data images are rejected',()=>{for(const s of ['javascript:alert(1)','data:text/html,attack','vbscript:evil'])assert.equal(safeURL(s),'');const out=markdown('[click](javascript:evil)\n![image](data:text/html,evil)');assert(!out.includes('href='));assert(!out.includes('<img'))});
test('Markdown headings, tables, quotes and code are supported safely',()=>{const out=markdown('## Heading\n\n| Name | Value |\n| --- | --- |\n| Safe | 1 |\n\n> Quote\n\n```js\n<script>unsafe</script>\n```');for(const s of ['<h2>Heading</h2>','<table>','<th>Name</th>','<td>Safe</td>','<blockquote>Quote</blockquote>','&lt;script&gt;unsafe'])assert(out.includes(s),s)});
test('attribute quotes and comment markup are escaped',()=>{assert.equal(esc('<img "x">'), '&lt;img &quot;x&quot;&gt;');assert(!markdown('![" onerror="alert](https://example.com/a.png)').includes(' onerror="'))});
test('only the explicit safe YouTube embed format becomes an iframe',()=>{assert(markdown('@[youtube](https://www.youtube.com/watch?v=abcdefghijk)').includes('https://www.youtube-nocookie.com/embed/abcdefghijk'));assert(!markdown('@[youtube](https://evil.test/watch?v=abcdefghijk)').includes('<iframe'));assert(!markdown('<iframe src="https://evil.test"></iframe>').includes('<iframe'))});

test('missing cover images do not become broken root or null URLs',()=>{for(const value of [null,undefined,'','   '])assert.equal(safeURL(value),'')});
