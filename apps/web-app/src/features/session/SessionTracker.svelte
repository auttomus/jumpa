<script lang="ts">
  import type { JumpaSession } from '@/types';
  import Panel from '@/components/svelte/Panel.svelte';
  import Button from '@/components/svelte/Button.svelte';

  export let session: JumpaSession | null;
  export let onGoEnRoute: () => void;
  export let onEndSession: () => void;
</script>

{#if session}
  <Panel class="!flex-row items-center gap-4 px-5 py-3 !rounded-[18px]">
    <div class="text-right">
      <p class="text-[9px] uppercase tracking-wider text-cyan-400 font-extrabold mb-0.5">{session.status} MODE</p>
      <p class="text-xs font-semibold text-text-primary">{session.name}</p>
    </div>
    <div class="flex gap-2">
      {#if session.status === 'DISCOVERY'}
        <Button variant="primary" on:click={onGoEnRoute} class="!px-3.5 !py-2 !rounded-xl">
          Start Journey
        </Button>
      {/if}
      <Button variant="danger" on:click={onEndSession} class="!px-3.5 !py-2 !rounded-xl">
        End
      </Button>
    </div>
  </Panel>
{/if}
