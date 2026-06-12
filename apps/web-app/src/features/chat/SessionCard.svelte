<script lang="ts">
  import type { JumpaSession } from '@/types';

  export let session: JumpaSession | null;
</script>

{#if session}
  <div class="bg-cyan-500/6 border border-cyan-500/15 rounded-2xl p-3.5 mb-4">
    <p class="text-[10px] font-extrabold text-cyan-300 uppercase m-0">Target Destination</p>
    <p class="text-xs font-semibold text-text-primary mt-0.5">{session.name}</p>
    <div class="flex items-center gap-2 text-[10px] text-text-secondary mt-2">
      <span class="bg-bg-space text-cyan-400 border border-cyan-500/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">{session.status}</span>
      <span>• Coordinates: {session.destination ? session.destination.map(n => n.toFixed(4)).join(', ') : ''}</span>
    </div>
  </div>
{/if}
