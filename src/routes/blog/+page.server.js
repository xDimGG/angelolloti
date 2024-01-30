import { error } from '@sveltejs/kit';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

const DIR = './posts/';
const posts = readdirSync(DIR).map(f => {
	const content = readFileSync(join(DIR, f), 'utf-8');
	const id = f.split('.')[0];
	const data = JSON.parse(content.split('---\n')[0]);

	return { id, ...data };
}).sort((a, b) => b.date - a.date);

export const load = () => ({ posts });
// export const prerender = true;

// export const prerender = true;
