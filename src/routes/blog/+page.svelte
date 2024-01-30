<script>
export let data;
</script>

<svelte:head>
<link rel="alternate" type="application/rss+xml" 
  title="RSS feed for Angelo Lloti's blog" 
  href="/rss.xml" />
<title>Angelo Lloti's Blog</title>
</svelte:head>

<div class="h-screen w-full px-3 py-8 dark:bg-slate-900">
	<div class="prose prose-img:max-h-[80vh] prose-gray dark:prose-invert lg:max-w-[1000px] mx-auto prose-a:no-underline">
		<h1 class="block">Angelo's Blog</h1>
		<ul class="marker:text-white">
			{#each data.posts as { id, title, date }}
			<li class="text-lg">
				<a href="/blog/{id}" class="hover:underline">{title}</a>
				<span class="text-slate-400 dark:text-opacity-30 dark:text-white text-xs align-middle">({new Date(date).toLocaleDateString()})</span>
			</li>
			{/each}
		</ul>
	</div>
</div>