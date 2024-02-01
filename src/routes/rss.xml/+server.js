import { posts } from '$lib/posts';

const DOMAIN = 'https://angelolloti.com';
const xml = `\
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <atom:link href="${DOMAIN}/rss.xml" rel="self" type="application/rss+xml" />
    <title>Angelo Lloti</title>
    <link>${DOMAIN}</link>
    <description>Angelo Lloti's blog about coding, math, and mechanic stuff</description>
    ${posts
      .map(post => `
    <item>
      <guid>${DOMAIN}/blog/${post.id}</guid>
      <title>${post.title}</title>
      <link>${DOMAIN}/blog/${post.id}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>
      `)
      .join('')}
  </channel>
</rss>`;

export const GET = () => {
  return new Response(xml, {
    headers: {
      'Cache-Control': 'max-age=0, s-maxage=3600',
      'Content-Type': 'application/xml',
    },
  });
};

export const trailingSlash = 'never';
export const prerender = true;
