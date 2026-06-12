<script lang="ts">
  export let variant: 'primary' | 'danger' | 'glass' | 'ghost' | 'icon' = 'primary';
  export let type: 'button' | 'submit' = 'button';
  export let disabled = false;
  export let ariaLabel = '';
  let className = '';
  export { className as class };

  $: baseClasses = "flex items-center justify-center font-extrabold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  $: variantClasses = 
    variant === 'primary' ? 'bg-cyan-500 hover:bg-cyan-400 text-bg-space px-4 py-2 rounded-xl text-[11px] shadow-[0_4px_15px_rgba(6,182,212,0.2)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:-translate-y-px active:translate-y-0' :
    variant === 'danger' ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 px-4 py-2 rounded-xl text-[11px]' :
    variant === 'glass' ? 'bg-white/3 border border-white/8 text-text-secondary hover:bg-white/8 hover:text-text-primary p-2 rounded-xl' :
    variant === 'ghost' ? 'text-text-secondary hover:text-text-primary' :
    variant === 'icon' ? 'w-[38px] h-[38px] rounded-xl bg-cyan-500 hover:bg-cyan-400 text-bg-space' : '';
</script>

<button
  {type}
  {disabled}
  aria-label={ariaLabel || undefined}
  class="{baseClasses} {variantClasses} {className}"
  on:click
>
  <slot />
</button>
