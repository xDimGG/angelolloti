import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const DIR = './posts/';
const posts = readdirSync(DIR).map(f => {
	const content = readFileSync(join(DIR, f), 'utf-8');
	const id = f.split('.')[0];
	const data = JSON.parse(content.split('---\n')[0]);

	return { id, ...data };
});

export const GET = () => {
  return new Response(render(posts), {
    headers: {
      'Cache-Control': 'max-age=0, s-maxage=3600',
      'Content-Type': 'application/xml',
    },
  });
};

const render = (posts) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<atom:link href="https://angelolloti.com/rss.xml" rel="self" type="application/rss+xml" />
<title>Angelo Lloti</title>
<link>https://angelolloti.com</link>
<description>Angelo Lloti's blog about coding, math, and mechanic stuff</description>
${posts
  .map(
    (post) => `<item>
<guid>https://angelolloti.com/blog/${post.id}</guid>
<title>${post.title}</title>
<link>https://angelolloti.com/blog/${post.id}</link>
<pubDate>${new Date(post.date).toUTCString()}</pubDate>
</item>`
  )
  .join('')}
</channel>
</rss>
`;

export const trailingSlash = 'never';
export const prerender = true;
