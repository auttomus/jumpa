<script lang="ts">
  import type { ChatMessage } from "@/types";
  import MessageItem from "@/features/chat/MessageItem.svelte";

  export let messages: ChatMessage[];
</script>

<div
  id="chat-feed"
  class="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 custom-scrollbar"
>
  {#each messages as msg (msg.id)}
    <MessageItem {msg} />
  {/each}
</div>
