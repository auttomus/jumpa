<script lang="ts">
  import type { Venue, JumpaSession } from '@/types';
  import Panel from '@/components/svelte/Panel.svelte';
  import Button from '@/components/svelte/Button.svelte';

  export let venuesList: readonly Venue[];
  export let selectedVenue: Venue | null;
  export let activeSession: JumpaSession | null;
  export let onVenueClick: (venue: Venue) => void;
  export let onStartSession: () => void;
</script>

<Panel class="max-h-[290px] md:max-w-[380px] !p-5">
  <div class="flex justify-between items-center border-b border-white/8 pb-2 mb-3">
    <h2 class="text-[11px] font-extrabold uppercase tracking-wider text-text-muted m-0">Discover Locations</h2>
    <span class="bg-bg-slate-800 text-text-secondary font-mono text-[9px] px-1.5 py-0.5 rounded">{venuesList.length} spots</span>
  </div>

  <!-- Scrollable List of Venues -->
  <div class="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[140px] pr-1 custom-scrollbar">
    {#each venuesList as venue (venue.id)}
      <button
        on:click={() => onVenueClick(venue)}
        class="w-full text-left flex justify-between items-start p-2.5 rounded-xl border border-transparent bg-transparent cursor-pointer transition-all duration-200 hover:border-bg-slate-800 hover:bg-white/3 {selectedVenue?.id === venue.id ? '!border-cyan-500/40 !bg-cyan-500/8' : ''}"
      >
        <div class="flex flex-col">
          <span class="text-[11.5px] font-bold text-text-primary">{venue.name}</span>
          <span class="text-[9.5px] text-text-secondary mt-0.5">{venue.address}</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="bg-bg-space text-cyan-400 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border border-cyan-500/15">{venue.category}</span>
          <span class="text-[9.5px] text-yellow-500 font-bold mt-1">★ {venue.weight}</span>
        </div>
      </button>
    {/each}
  </div>

  <!-- Selected Venue Details Action -->
  {#if selectedVenue}
    <div class="flex justify-between items-center border-t border-white/8 pt-3 mt-3">
      <div class="flex flex-col">
        <span class="text-[9px] uppercase font-bold text-text-muted">Selected Hub</span>
        <span class="text-xs font-extrabold text-cyan-300">{selectedVenue.name}</span>
      </div>
      {#if !activeSession}
        <Button variant="primary" on:click={onStartSession} class="gap-1.5 px-4 py-2 !rounded-xl">
          <span>Jumpa Here!</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Button>
      {/if}
    </div>
  {/if}
</Panel>
