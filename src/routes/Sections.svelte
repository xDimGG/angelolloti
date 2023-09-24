<script>
import { register } from 'swiper/element/bundle';
import { onMount } from 'svelte';
import works from '$lib/works.js';
import { stylize } from '$lib/stylize';
import { 
	Fullpage,
	FullpageSection,
} from 'svelte-fullpage';

export let swiper;
export let control;

let pinned = [];

onMount(async () => {
	// fetch('https://gh-pinned-repos.egoist.dev/?username=xdimgg')
	// 	.then(res => res.json())
	// 	.then(j => pinned = j)
	// api is too slow
	pinned = [{"owner":"xdimgg","repo":"node-steamapi","link":"https://github.com/xdimgg/node-steamapi","description":"An object-oriented Steam API wrapper for Node.js developers.","image":"https://opengraph.githubassets.com/1/xdimgg/node-steamapi","website":"https://www.npmjs.com/package/steamapi","language":"JavaScript","languageColor":"#f1e05a","stars":"148","forks":0},{"owner":"xdimgg","repo":"card-game","link":"https://github.com/xdimgg/card-game","description":"A bunch of card games all on one site for you to play with your friends. Built using Vue, Go, and WebSockets.","image":"https://opengraph.githubassets.com/1/xdimgg/card-game","website":"https://cg.dim.codes/","language":"Go","languageColor":"#00ADD8","stars":0,"forks":0},{"owner":"xdimgg","repo":"starboard","link":"https://github.com/xdimgg/starboard","description":"A starboard dedicated Discord bot.","image":"https://opengraph.githubassets.com/1/xdimgg/starboard","language":"Go","languageColor":"#00ADD8","stars":"22","forks":0},{"owner":"xdimgg","repo":"nn-rust","link":"https://github.com/xdimgg/nn-rust","description":"My attempt to create a multilayer neural network in Rust using stochastic gradient descent, backpropagation, and momentum.","image":"https://opengraph.githubassets.com/1/xdimgg/nn-rust","language":"Rust","languageColor":"#dea584","stars":0,"forks":0},{"owner":"xdimgg","repo":"os-scheduler","link":"https://github.com/xdimgg/os-scheduler","description":"An OS scheduler built in Java for my operating systems class.","image":"https://opengraph.githubassets.com/1/xdimgg/os-scheduler","language":"Java","languageColor":"#b07219","stars":0,"forks":0},{"owner":"xdimgg","repo":"aoc-solutions","link":"https://github.com/xdimgg/aoc-solutions","description":"My solutions to Advent of Code problems in Python, Rust, and JavaScript.","image":"https://opengraph.githubassets.com/1/xdimgg/aoc-solutions","language":"Python","languageColor":"#3572A5","stars":0,"forks":0}];
});

$: if (swiper && control) swiper.swiper.controller.control = control.swiper;

register();

</script>

<Fullpage class="sections">
<FullpageSection class="odd h-screen" title="first">
	<div class="w-full mx-auto h-screen flex flex-col-reverse md:flex-row items-center justify-center md:justify-around">
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
			<img src="/me.jpeg" alt="Angelo Lloti" class="shadow-[0_0_40px_-10px_#e0e2e6] w-100% max-h-[50vh] md:max-h-[60vh] rounded-full">
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
</FullpageSection>

<FullpageSection class="h-screen" title="second">
	<div class="h-screen container mx-auto flex items-center flex-col">
		<span class="text-5xl text-center sm:text-8xl w-full sm:w-auto my-10 py-4 sm:px-20 text-black bg-white mix-blend-lighten font-bold"  data-animate-right>My Websites</span>
		<swiper-container
			speed="500"
			loop="true"
			slides-per-view="1"
			class="max-w-full sm:w-5/6 min-h-0 h-full max-h-full self-start pb-10"
			pagination={true}
			autoplay-delay={control === null ? undefined : 4000}
			style="--swiper-pagination-color: white; --swiper-pagination-bullet-size: 12px"
			data-animate-up
			bind:this={swiper}
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
</FullpageSection>

<FullpageSection class="odd h-screen" title="third">
	<div class="container mx-auto text-gray-600 flex items-center flex-col">
		<span class="text-5xl text-center sm:text-8xl w-full sm:w-auto my-10 py-4 sm:px-20 text-black bg-white mix-blend-lighten font-bold" data-animate-right>My Projects</span>
		<div class="container px-5 mx-auto">
			<div class="flex flex-wrap -m-4">
				{#each pinned as pin, i}
					<div class="p-4 w-full md:w-1/3 md:block {i >= 3 ? 'hidden' : ''}" data-animate-up>
						<div class="h-full bg-slate-900 px-8 pt-10 pb-12 rounded-lg overflow-hidden text-center relative">
							<h2 class="tracking-widest text-xs title-font font-medium mb-1 opacity-80">{@html stylize(pin.language)}</h2>
							<a class="title-font sm:text-2xl hover:underline text-xl font-medium text-white mb-3" href={pin.link} target="_blank">{pin.repo}</a>
							<p class="leading-relaxed mb-3 text-gray-400">{@html stylize(pin.description)}</p>
							<div class="text-center mt-2 leading-none flex justify-center absolute bottom-0 left-0 w-full py-4">
								<span class="text-gray-400 mr-3 inline-flex items-center leading-none text-sm pr-3 py-1">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="w-4 h-4 mr-1 -mt-0.5" fill="currentColor" stroke="none">
										<path d="M12 5.173l2.335 4.817 5.305.732-3.861 3.71.942 5.27-4.721-2.524-4.721 2.525.942-5.27-3.861-3.71 5.305-.733 2.335-4.817zm0-4.586l-3.668 7.568-8.332 1.151 6.064 5.828-1.48 8.279 7.416-3.967 7.416 3.966-1.48-8.279 6.064-5.827-8.332-1.15-3.668-7.569z" />
									</svg>{pin.stars}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</FullpageSection>
</Fullpage>

<style>
:global(div.svelte-fp-section-indicator) {
	right: inherit !important;
}
</style>