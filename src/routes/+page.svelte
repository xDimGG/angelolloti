<script>
import Sections from './Sections.svelte';

let scroll, hoverScroll, control;
// $: console.log(control);

const moveTo = ({ offsetY }) => window.scrollTo({ top: offsetY - window.innerHeight / 2 });
const updateHover = ({ offsetY }) =>
  hoverScroll = Math.min(document.body.scrollHeight - window.innerHeight / 2, Math.max(window.innerHeight / 2, offsetY)) - window.innerHeight / 2;
</script>

<svelte:window bind:scrollY={scroll} />

<Sections control={control} />

<!-- don't render mini view until first swiper has initialized -->
<!-- <div
  class="hidden md:block sections mini-view"
  style={`--scrollbar-offset: ${scroll}px; --hover-scrollbar-offset: ${hoverScroll}px`}
  on:click|preventDefault={moveTo}
  on:mousemove={updateHover}
  role="none"
>
  <Sections bind:swiper={control} control={null} />
</div> -->
