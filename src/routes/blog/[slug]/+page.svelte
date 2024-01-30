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
				<span>
					{new Date(data.date).toDateString().split(' ').slice(1).join(' ')}
				</span>
				<br>
				<a href="/blog/" class="text-white text-opacity-50 pt-2 block">other stuff</a>
			</div>
		</div>

		{@html data.content}
	</div>
</div>
