import { error } from '@sveltejs/kit';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

const DIR = './posts/';
const posts = new Map(readdirSync(DIR).map(f => {
	const content = readFileSync(join(DIR, f), 'utf-8');
	const id = f.split('.')[0];
	const [meta, ...md] = content.split('---\n');
	const data = JSON.parse(meta);

	return [id, { ...data, content: marked.parse(md.join('---\n')) }];
}));

export const load = async ({ params: { slug } }) => {
	if (posts.has(slug))
		return posts.get(slug);

	error(404, 'Not found');
}

// export const prerender = true;
