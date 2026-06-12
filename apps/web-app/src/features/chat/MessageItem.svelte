<script lang="ts">
  import type { ChatMessage } from '@/types';

  export let msg: ChatMessage;
</script>

{#if msg.isSystem}
  <div class="flex justify-center my-2">
    <span class="bg-bg-space border border-white/5 text-cyan-400 text-[9px] font-bold px-2.5 py-1 rounded-lg text-center">
      {msg.text}
    </span>
  </div>
{:else}
  <div class="flex flex-col {msg.sender === 'You' ? 'items-end' : 'items-start'}">
    <div class="flex items-baseline gap-1.5 mb-0.5">
      <span class="text-[9px] font-extrabold text-text-muted">{msg.sender}</span>
      <span class="text-[8.5px] text-text-muted">{msg.time}</span>
    </div>
    <div class="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-normal border border-white/5 {msg.sender === 'You' ? 'bg-gradient-to-br from-cyan-600 to-cyan-500 text-bg-space rounded-tr-none font-medium' : 'bg-bg-slate-900 text-text-primary rounded-tl-none border-white/6'}">
      {msg.text}
    </div>
  </div>
{/if}
