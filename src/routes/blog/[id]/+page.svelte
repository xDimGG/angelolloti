<script>
import 'highlight.js/styles/tomorrow-night-blue.css';

export let data;
</script>

<style>
:global(pre code.hljs) {
	background: transparent !important;
	padding: 0.5em !important;
	font-family: Inconsolata, Monaco, 'Courier New', monospace !important;
	/* font-size: medium; */
}
</style>

<svelte:head>
<title>{data.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="min-h-screen w-full dark:bg-slate-900 px-3 py-8">
	<div class="prose prose-img:max-h-[80vh] prose-img:mx-auto prose-code:break-words prose-gray dark:prose-invert lg:max-w-[1000px] mx-auto">
		<div class="flex justify-between">
			<h1 class="mb-0">{data.title}</h1>
			<div class="block text-xs text-right text-opacity-50 shrink-0 ml-2">
				<a href="/blog/" class="xt-slate-500 dark:text-white block no-underline hover:underline">other posts</a>
				<span class="text-slate-500 dark:text-slate-400">
					{new Date(data.date).toLocaleDateString()}
				</span>
			</div>
		</div>
		{#each data.tags.sort() as tag, i}
			<a href="/blog/?tag={tag}" class="no-underline text-xs hover:underline text-slate-500 dark:text-slate-400">{tag}</a><span class="text-slate-500 dark:text-slate-400">{i === data.tags.length - 1 ? '' : ', '}</span>
		{/each}

		{@html data.html}
	</div>
</div>
