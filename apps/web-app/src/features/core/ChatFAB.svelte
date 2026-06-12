<script lang="ts">
  import { toggleChat, setBlackholeOrigin } from '@/store/mapStore';

  export let isChatOpen: boolean;

  let chatButtonEl: HTMLButtonElement;

  function handleChatToggle() {
    if (chatButtonEl) {
      const rect = chatButtonEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setBlackholeOrigin(x, y);
    }
    toggleChat();
  }
</script>

<div class="flex justify-end">
  <button
    bind:this={chatButtonEl}
    on:click={handleChatToggle}
    class="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-400 text-bg-space flex items-center justify-center cursor-pointer shadow-[0_8px_24px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-108 hover:shadow-[0_8px_32px_rgba(6,182,212,0.5)] active:scale-95"
    aria-label="Toggle Chat"
  >
    <span class="absolute w-full h-full rounded-full bg-cyan-400 opacity-20 animate-ping"></span>
    
    {#if isChatOpen}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.598.598 0 0 1-.655-.705l.408-1.9a7.95 7.95 0 0 1-1.393-4.576C3.77 7.444 7.8 3.75 12.75 3.75S21 7.444 21 12Z" />
      </svg>
    {/if}
  </button>
</div>
