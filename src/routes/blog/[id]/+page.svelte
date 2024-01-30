<script>
export let data;
</script>

<svelte:head>
<title>{data.title}</title>
</svelte:head>

<div class="min-h-screen w-full dark:bg-slate-900 px-3 py-8">
	<div class="prose prose-img:max-h-[80vh] prose-gray dark:prose-invert lg:max-w-[1000px] mx-auto">
		<div class="flex justify-between">
			<h1 class="mb-0">{data.title}</h1>
			<div class="text-white block text-xs text-right text-opacity-50 shrink-0 ml-2">
				<a href="/blog/" class="text-white block no-underline hover:underline">other posts</a>
				<span>
					{new Date(data.date).toLocaleDateString()}
				</span>
				<br>
				<span>tags:
					{#each data.tags.sort() as tag, i}
						<a href="/blog/?tag={tag}" class="no-underline hover:underline">{tag}</a>{i === data.tags.length - 1 ? '' : ', '}
					{/each}
				</span>
			</div>
		</div>

		{@html data.content}
	</div>
</div>
