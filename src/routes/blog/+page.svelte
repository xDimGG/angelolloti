<script>
export let data;
</script>

<svelte:head>
<link rel="alternate" type="application/rss+xml" 
  title="RSS feed for Angelo Lloti's blog" 
  href="/rss.xml" />
<title>Angelo Lloti's Blog</title>
</svelte:head>

<div class="h-screen w-screen px-3 dark:bg-slate-900">
	<div class="container lg:max-w-[1000px] mx-auto dark:text-white">
		<span class="block text-4xl py-5">Angelo's Blog</span>
		<ul class="list-disc list-inside">
			{#each data.posts as { id, title, date }}
			<li class="text-lg hover:underline">
				<a href="/blog/{id}">{title}</a>
				<span class="text-slate-400 dark:text-opacity-40 dark:text-white text-xs align-middle">({new Date(date).toLocaleDateString()})</span>
			</li>
			{/each}
		</ul>
	</div>
</div>