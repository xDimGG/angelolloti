<script>
export let data;
</script>

<div class="min-h-screen w-screen px-3 dark:bg-slate-900 py-8">
	<div class="prose prose-img:max-h-[80vh] lg:max-w-[1000px] prose-gray  dark:prose-invert mx-auto">
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
