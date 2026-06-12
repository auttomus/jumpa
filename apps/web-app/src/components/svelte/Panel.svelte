<script lang="ts">
  let className = '';
  export { className as class };
</script>

<div class="glass-panel rounded-3xl p-5 w-full flex flex-col transition-all duration-300 {className}">
  <slot />
</div>
