<script>
import { register } from 'swiper/element/bundle';
import { onMount } from 'svelte';
import works from '$lib/works.js';
import experience from '$lib/experience.js';
import { stylize } from '$lib/stylize';

let pinned = [];

const fallbackPinned = [{"name":"node-steamapi","description":"An object-oriented Steam API wrapper for Node.js developers.","url":"https://github.com/xDimGG/node-steamapi","createdAt":"2017-08-30T03:45:42Z","updatedAt":"2024-01-19T15:16:03Z","openGraphImageUrl":"https://opengraph.githubassets.com/8f786189aa79c8996d739bcc2d51bf6f9b1ebf3df601fcf39a432fb257cc1e34/xDimGG/node-steamapi","forkCount":75,"stargazerCount":158,"primaryLanguage":{"name":"TypeScript"}},{"name":"card-game","description":"A bunch of card games all on one site for you to play with your friends. Built using Vue, Go, and WebSockets.","url":"https://github.com/xDimGG/card-game","createdAt":"2023-02-23T15:21:55Z","updatedAt":"2024-01-10T21:29:25Z","openGraphImageUrl":"https://opengraph.githubassets.com/cc7f07dbb411c8af2b8a423be1fea5f41ee4b8342960d164e9e83b6398ce6158/xDimGG/card-game","forkCount":0,"stargazerCount":1,"primaryLanguage":{"name":"Go"}},{"name":"starboard","description":"A starboard dedicated Discord bot.","url":"https://github.com/xDimGG/starboard","createdAt":"2017-11-19T05:50:33Z","updatedAt":"2023-04-16T18:56:22Z","openGraphImageUrl":"https://opengraph.githubassets.com/2504757f39de50a5fe784ef46956e8dfaca41928c8af84b70ceb760f39edebd3/xDimGG/starboard","forkCount":5,"stargazerCount":22,"primaryLanguage":{"name":"Go"}},{"name":"nn-rust","description":"My attempt to create a multilayer neural network in Rust using stochastic gradient descent, backpropagation, and momentum.","url":"https://github.com/xDimGG/nn-rust","createdAt":"2023-05-29T18:23:24Z","updatedAt":"2023-09-22T15:05:18Z","openGraphImageUrl":"https://opengraph.githubassets.com/0cd414a12b3fd76571aa1a18414746351a64a311e100906f82c76c302527eff9/xDimGG/nn-rust","forkCount":0,"stargazerCount":0,"primaryLanguage":{"name":"Rust"}},{"name":"os-scheduler","description":"An OS scheduler built in Java for my operating systems class.","url":"https://github.com/xDimGG/os-scheduler","createdAt":"2023-03-26T22:37:28Z","updatedAt":"2023-09-22T17:23:15Z","openGraphImageUrl":"https://opengraph.githubassets.com/4c4471bfa3727f212f994de0e7ab98c38a58f384e749b00267aa4412f6db4038/xDimGG/os-scheduler","forkCount":0,"stargazerCount":0,"primaryLanguage":{"name":"Java"}},{"name":"aoc-solutions","description":"My solutions to Advent of Code problems in Python, Rust, and JavaScript.","url":"https://github.com/xDimGG/aoc-solutions","createdAt":"2023-05-29T17:37:13Z","updatedAt":"2023-09-22T15:06:43Z","openGraphImageUrl":"https://opengraph.githubassets.com/93e691050eeb9db4b5fc9588e49b83751afdae65f44c2798a7a08337b9724cb7/xDimGG/aoc-solutions","forkCount":0,"stargazerCount":0,"primaryLanguage":{"name":"Python"}}];

onMount(async () => {
	for (const el of document.querySelectorAll('[data-animate-left]')) {
		new IntersectionObserver(([evt]) => {
			if (evt.isIntersecting)
				evt.target.classList.add('animate__animated', 'animate__fadeInLeft', 'animate__fast')
		}).observe(el);
	}

	for (const el of document.querySelectorAll('[data-animate-up]')) {
		new IntersectionObserver(([evt]) => {
			if (evt.isIntersecting)
				evt.target.classList.add('animate__animated', 'animate__fadeInUp', 'animate__fast')
		}).observe(el);
	}

	fetch('https://pinned-repos.itsmani.workers.dev/xDimGG')
		.then(res => res.json())
		.then(j => pinned = j.length > 1 ? j : fallbackPinned)
		.catch(() => pinned = fallbackPinned);
});

const goDown = () => document.body.querySelector('.sections').scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

register();

</script>

<div class="sections">
	<div class="h-screen flex flex-col items-center">
		<div class="w-full text-right">
			<a class="text-black bg-white bg-opacity-75 text-lg py-1 px-2 rounded-bl-md" href="/blog">go to my blog</a>
		</div>
		<div class="w-full mx-auto flex-grow flex flex-col-reverse md:flex-row items-center justify-center md:justify-around">
			<div>
				<!-- padding to vertically center Angelo Lloti -->
				<p class="text-2xl opacity-0 hidden md:block">.</p>
				<p class="text-2xl opacity-0 hidden md:block">.</p>
				<p class="text-2xl opacity-0">.</p>
				<p class="text-green-400 text-4xl md:text-6xl animation-fadein animation__fadeInRight animation-1 pb-3 font-bold">Angelo Lloti</p>
				<p class="text-slate-400 text-2xl animation-fadein animation-2 indent-2">Software Developer</p>
				<p class="text-slate-400 text-opacity-70 text-2xl animation-fadein animation-3 indent-2">Technology Enthusiast</p>
				<p class="text-slate-400 text-opacity-50 text-2xl animation-fadein animation-4 indent-2">Website Designer</p>
			</div>
			<div class="max-w-[80%] md:max-h-[60vh] animation-fadein animation-1 md:animation-2 links">
				<img src="/me.jpeg" alt="Angelo Lloti" class="shadow-[0_0_40px_-10px_#e0e2e6] w-100% max-h-[50vh] md:max-h-[60vh] rounded-full relative z-10">
				<div class="w-100 flex items-center justify-around pt-3">
					<a href="/Angelo_Lloti_Resume.pdf" class="fill-black bg-white p-4 rounded-full -mt-14 sm:-mt-20">
						<svg class="w-12 sm:w-16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M22 0h-20v24h14l6-6v-18zm-7 23h-12v-22h18v16h-6v6zm1-5h4.586l-4.586 4.586v-4.586zm-3 1h-8v1h8v-1zm0-3h-8v1h8v-1zm6-2v-1h-14v1h14zm0-4h-4v1h4v-1zm-6.006 1h-7.991l-.003-.789c-.003-.72-.006-1.615 1.314-1.92 1.483-.341 1.236-.418 1.158-.563-1.078-1.988-.71-3.173-.395-3.703.388-.651 1.089-1.025 1.923-1.025.827 0 1.523.368 1.91 1.011.545.904.409 2.222-.379 3.713-.105.196-.195.255 1.119.559 1.355.312 1.352 1.212 1.35 1.936l-.006.781zm-6.994-1h6c-.007-.547-.07-.626-.54-.734-.855-.198-1.629-.376-1.901-.972-.142-.311-.113-.66.087-1.039.61-1.151.758-2.146.407-2.729-.276-.458-.778-.526-1.053-.526-.48 0-.857.19-1.063.537-.352.59-.201 1.58.414 2.714.204.377.236.727.095 1.039-.269.598-1.036.774-1.847.962-.525.121-.593.202-.599.748zm13-2v-1h-4v1h4zm0-4h-4v1h4v-1z"/></svg>
					</a>
					<a href="https://www.linkedin.com/in/lloti/" class="fill-black bg-white p-4 rounded-full">
						<svg class="w-12 sm:w-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 8c0 .557-.447 1.008-1 1.008s-1-.45-1-1.008c0-.557.447-1.008 1-1.008s1 .452 1 1.008zm0 2h-2v6h2v-6zm3 0h-2v6h2v-2.861c0-1.722 2.002-1.881 2.002 0v2.861h1.998v-3.359c0-3.284-3.128-3.164-4-1.548v-1.093z"/></svg>
					</a>
					<a href="https://github.com/xdimgg" class="fill-black bg-white p-4 rounded-full -mt-14 sm:-mt-20">
						<svg class="w-12 sm:w-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
					</a>
				</div>
			</div>
		</div>
		<div class="fill-gray-400 hover:fill-white transition-colors animate__animated animate__bounce animate__delay-5s py-5 cursor-pointer" on:keypress={goDown} on:click={goDown} role="button" tabindex="0">
			<svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M24 12c0-6.623-5.377-12-12-12s-12 5.377-12 12 5.377 12 12 12 12-5.377 12-12zm-1 0c0-6.071-4.929-11-11-11s-11 4.929-11 11 4.929 11 11 11 11-4.929 11-11zm-11.5 4.828l-3.763-4.608-.737.679 5 6.101 5-6.112-.753-.666-3.747 4.604v-11.826h-1v11.828z"/></svg>
		</div>
	</div>

	<div class="h-screen container mx-auto flex flex-col items-center">
		<span class="text-5xl text-center sm:text-8xl w-full sm:w-auto sm:mt-10 mb-10 py-4 sm:px-20 text-black bg-white mix-blend-lighten font-bold" data-animate-left>My Websites</span>
		<swiper-container
			speed="500"
			loop="true"
			slides-per-view="1"
			class="max-w-full sm:w-5/6 min-h-0 h-full max-h-full self-start pb-5"
			pagination={true}
			autoplay-delay={4000}
			style="--swiper-pagination-color: white; --swiper-pagination-bullet-size: 12px; --swiper-pagination-bottom: 0px"
			mousewheel-force-to-axis={true}
			data-animate-up
		>
			{#each works as work}
				<swiper-slide class="flex justify-center">
					<div class="max-h-full w-full bg-cover bg-center" style="background-image: url({work.image})">
						<div class="bg-black bg-opacity-80 p-5 w-full md:h-full md:w-1/4 self-end">
							<a href={work.href} target="_blank" class="text-4xl space-x-2 text-white font-bold hover:underline">
								{work.name}<svg xmlns="http://www.w3.org/2000/svg" class="inline ml-2" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/></svg>
							</a>
							<p class="text-gray-300 text-xl pt-4">{@html stylize(work.description)}</p>
						</div>
					</div>
				</swiper-slide>
			{/each}
		</swiper-container>
	</div>

	<div class="h-screen text-gray-600 flex flex-col items-center w-full">
		<span class="text-5xl text-center sm:text-8xl sm:w-auto sm:mt-10 mb-10 py-4 sm:px-20 text-black bg-white mix-blend-lighten font-bold w-full" data-animate-left>My Projects</span>
		<div class="h-full mx-auto flex flex-wrap flex-col md:flex-row overflow-x-scroll mb-4 container" data-animate-up>
			{#each pinned as pin}
				<div class="p-2 w-11/12 md:w-1/3">
					<div class="h-full bg-slate-900 px-8 py-10 rounded-lg overflow-hidden text-center relative">
						<h2 class="tracking-widest text-xs title-font font-medium mb-1 opacity-80">{@html stylize(pin.primaryLanguage.name)}</h2>
						<a class="title-font sm:text-2xl hover:underline text-xl font-medium text-white mb-3" href={pin.url} target="_blank">{pin.name}</a>
						<p class="leading-relaxed text-gray-400">{@html stylize(pin.description)}</p>
						<div class="text-center leading-none flex justify-center absolute bottom-0 left-0 w-full py-4">
							<span class="text-gray-400 mr-3 inline-flex items-center leading-none text-sm pr-3 py-1">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="w-4 h-4 mr-1 -mt-0.5" fill="currentColor" stroke="none">
									<path d="M12 5.173l2.335 4.817 5.305.732-3.861 3.71.942 5.27-4.721-2.524-4.721 2.525.942-5.27-3.861-3.71 5.305-.733 2.335-4.817zm0-4.586l-3.668 7.568-8.332 1.151 6.064 5.828-1.48 8.279 7.416-3.967 7.416 3.966-1.48-8.279 6.064-5.827-8.332-1.15-3.668-7.569z" />
								</svg>{pin.stargazerCount}
							</span>
						</div>
					</div>
				</div>
			{:else}
				<div role="status" class="w-full h-full flex flex-col items-center justify-center">
					<svg aria-hidden="true" class="w-8 h-8 mr-2 animate-spin text-gray-400 fill-blue-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
						<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
					</svg>
					<span class="sr-only">Loading...</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="h-screen container mx-auto text-gray-400 flex flex-col items-center">
		<span class="text-5xl text-center sm:text-8xl w-full sm:w-auto sm:mt-10 mb-10 py-4 sm:px-20 text-black bg-white mix-blend-lighten font-bold" data-animate-left>My Experience</span>
		<div class="divide-y-2 divide-gray-500 overflow-y-scroll -mt-2" data-animate-up>
			{#each experience as job}
				<div class="py-4 flex flex-wrap md:flex-nowrap">
					<div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
						<span class="font-semibold text-lg title-font text-white">{job.company}</span>
						<span class="mt-1 text-gray-500 text-sm">{job.startDate} &mdash; {job.endDate}</span>
					</div>
					<div class="md:flex-grow">
						<h2 class="text-2xl font-medium text-white title-font mb-2">{job.position}</h2>
						<ul class="leading-relaxed list-disc ml-4">
							{#each job.points as point}
								<li>{@html stylize(point)}</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- <div class="h-screen container mx-auto text-gray-400 flex flex-col items-center">
		<span class="text-5xl text-center sm:text-8xl w-full sm:w-auto sm:mt-10 mb-10 py-4 sm:px-20 text-black bg-white mix-blend-lighten font-bold" data-animate-left>Contact Me</span>

	</div> -->
</div>
