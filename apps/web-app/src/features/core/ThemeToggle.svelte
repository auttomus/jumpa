<script lang="ts">
  import { mapTheme, setMapTheme, type MapThemeMode } from '@/store/mapStore';

  const modes: MapThemeMode[] = ['auto', 'day', 'sunset', 'night'];

  function cycleTheme() {
    const current = $mapTheme;
    const currentIndex = modes.indexOf(current);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMapTheme(modes[nextIndex]);
  }

  // Get readable label for screen readers
  $: label = `Map Theme: ${$mapTheme.toUpperCase()}`;
</script>

<button
  on:click={cycleTheme}
  class="pointer-events-auto flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-[18px] border border-white/8 bg-white/3 backdrop-blur-md text-text-primary shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-all duration-300 hover:bg-white/10 active:scale-95 cursor-pointer relative"
  title={label}
  aria-label={label}
>
  {#if $mapTheme === 'auto'}
    <!-- Auto Theme: Clock with subtle neon cyan sparkle -->
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-cyan-400">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
    <span class="absolute top-1.5 right-1.5 flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
    </span>
  {:else}
    <span class="transition-transform duration-300 rotate-0 hover:rotate-12">
      {#if $mapTheme === 'day'}
        <!-- Day Theme: Sun -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-yellow-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      {:else}
        {#if $mapTheme === 'sunset'}
          <!-- Sunset Theme: Sunset / Horizon -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-orange-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 14.25a3 3 0 0 0 0-6" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 16.5h15" />
          </svg>
        {:else}
          <!-- Night Theme: Moon -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-indigo-300">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        {/if}
      {/if}
    </span>
  {/if}
</button>
