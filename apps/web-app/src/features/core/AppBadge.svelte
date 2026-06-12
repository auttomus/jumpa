<script lang="ts">
  import Panel from '@/components/svelte/Panel.svelte';
</script>

<Panel class="!w-auto flex-row items-center gap-3 px-[18px] py-3 !rounded-[18px]">
  <div class="relative flex w-3 h-3">
    <span class="absolute w-full h-full rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
    <span class="relative w-3 h-3 rounded-full bg-cyan-500"></span>
  </div>
  <div class="flex flex-col">
    <h1 class="text-[13px] font-extrabold tracking-wider text-text-primary uppercase leading-tight">JUMPA</h1>
    <p class="text-[10px] text-text-secondary font-medium">Real-time Spatial Matching</p>
  </div>
</Panel>
