<script>
export let data;
import { page } from '$app/stores';
import { browser } from '$app/environment';

$: tag = browser ? $page.url.searchParams.get('tag') : '';
$: posts = tag ? data.posts.filter(p => p.tags.includes(tag)) : data.posts;
</script>

<svelte:head>
<link rel="alternate" type="application/rss+xml" 
  title="RSS feed for Angelo Lloti's blog" 
  href="/rss.xml" />
<title>Angelo Lloti's Blog</title>
</svelte:head>

<div class="h-screen w-full px-3 py-8 dark:bg-slate-900">
	<div class="prose prose-img:max-h-[80vh] prose-gray dark:prose-invert lg:max-w-[1000px] mx-auto prose-a:no-underline hover:prose-a:underline">
		<div class="flex justify-between">
			<h1 class="block">Angelo's Blog</h1>
			{#if tag}
				<a href="/blog/" class="text-white block text-xs">clear filter</a>
			{/if}
		</div>
		<ul class="marker:text-white">
			{#each posts as { id, title, date, tags }}
			<li class="text-lg">
				<a href="/blog/{id}/">{title}</a>
				<span class="text-slate-400 dark:text-opacity-30 dark:text-white text-xs align-middle">{
					'('}{#each tags.sort() as tag, i}
						<a href="/blog/?tag={tag}">{tag}</a>{i === tags.length - 1 ? '' : ', '
					}{/each}; {new Date(date).toLocaleDateString()})</span>
			</li>
			{/each}
		</ul>
	</div>
</div>