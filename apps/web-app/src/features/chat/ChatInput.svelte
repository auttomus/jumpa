<script lang="ts">
  import Button from '@/components/svelte/Button.svelte';
  import Input from '@/components/svelte/Input.svelte';

  export let value = '';
  export let onSend: () => void;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      onSend();
    }
  }
</script>

<div class="flex gap-2 border-t border-white/8 pt-4 mt-4">
  <Input
    placeholder="Type a message..."
    bind:value
    on:keydown={handleKeyDown}
    class="!rounded-xl"
  />
  <Button variant="icon" on:click={onSend} ariaLabel="Send message" class="!rounded-xl">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  </Button>
</div>
