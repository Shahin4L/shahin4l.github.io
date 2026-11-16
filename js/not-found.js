// GitHub Pages cannot rewrite clean article routes. Recover strict blog slugs only.
const match=location.pathname.match(/^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/bn)?\/?$/);
if(match)location.replace('/blog/article.html?slug='+encodeURIComponent(match[1])+(location.pathname.includes('/bn')?'&lang=bn':'')+location.search.replace(/^\?/,'&'));
