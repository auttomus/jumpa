<script lang="ts">
  export let value = '';
  export let placeholder = '';
  export let type = 'text';
  let className = '';
  export { className as class };
</script>

<input
  {type}
  {placeholder}
  bind:value
  class="flex-1 rounded-xl border border-white/8 bg-white/2 px-4 py-2.5 text-xs text-text-primary outline-none transition-all duration-200 focus:border-cyan-500/40 focus:bg-white/5 placeholder-text-muted {className}"
  on:keydown
/>
