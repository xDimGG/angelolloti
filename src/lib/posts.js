import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

const DIR = './posts/';

export const posts = readdirSync(DIR).map(f => {
	const content = readFileSync(join(DIR, f), 'utf-8');
	const id = f.split('.')[0];
	const [meta, ...md] = content.split('---\n');
	const data = JSON.parse(meta);

	return { id, content, html: marked.parse(md.join('---\n')), ...data };
}).sort((a, b) => b.date - a.date);
