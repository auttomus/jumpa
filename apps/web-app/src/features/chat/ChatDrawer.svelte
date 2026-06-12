<script lang="ts">
  import { 
    isChatOpen, 
    blackholeOrigin, 
    activeSession
  } from '@/store/mapStore';
  import type { ChatMessage } from '@/types';
  import ChatHeader from '@/features/chat/ChatHeader.svelte';
  import SessionCard from '@/features/chat/SessionCard.svelte';
  import MessageFeed from '@/features/chat/MessageFeed.svelte';
  import ChatInput from '@/features/chat/ChatInput.svelte';

  let chatContainerEl: HTMLDivElement;

  let messages: ChatMessage[] = [
    { id: '1', sender: 'System', text: 'Spatial session established. Anchoring user coordinates.', time: '12:30', isSystem: true },
    { id: '2', sender: 'Budi', text: 'Guys, I\'m on my way to the designated spot. The spatial engine recommended SCBD.', time: '12:31', isSystem: false },
    { id: '3', sender: 'Siti', text: 'Nice! The isochrone intersection looks solid. I am departing now.', time: '12:33', isSystem: false },
  ];
  let newMessageText = '';

  $: applyBlackholeEffect($isChatOpen);

  $: if ($activeSession) {
    const systemText = `New Jumpa session started: "${$activeSession.name}"`;
    if (!messages.some(m => m.text === systemText)) {
      messages = [
        ...messages,
        { 
          id: `sys-${Date.now()}`, 
          sender: 'System', 
          text: systemText, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          isSystem: true 
        }
      ];
    }
  }

  function applyBlackholeEffect(open: boolean) {
    const mapViewport = document.getElementById('map-viewport');
    if (!mapViewport) return;

    if (open) {
      mapViewport.style.transform = 'scale(0.93) translate3d(-30px, 0, 0)';
      mapViewport.style.filter = 'brightness(0.4) contrast(1.1) blur(4px)';
      mapViewport.style.borderRadius = '2.5rem';
      mapViewport.style.boxShadow = '0 25px 70px -10px rgba(0,0,0,0.9), 0 0 60px rgba(6,182,212,0.1)';
    } else {
      mapViewport.style.transform = 'scale(1) translate3d(0, 0, 0)';
      mapViewport.style.filter = 'none';
      mapViewport.style.borderRadius = '0';
      mapViewport.style.boxShadow = 'none';
    }
  }

  function sendMessage() {
    if (!newMessageText.trim()) return;
    messages = [
      ...messages,
      {
        id: `msg-${Date.now()}`,
        sender: 'You',
        text: newMessageText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: false
      }
    ];
    newMessageText = '';
    
    setTimeout(() => {
      const feed = document.getElementById('chat-feed');
      if (feed) {
        feed.scrollTop = feed.scrollHeight;
      }
    }, 50);
  }
</script>

<div bind:this={chatContainerEl} class="fixed inset-0 z-30 pointer-events-none flex items-center justify-end p-6">
  <!-- Floating Glassmorphic Chat Panel -->
  <div
    class="pointer-events-auto flex flex-col w-full max-w-[400px] h-[calc(100vh-48px)] rounded-[40px] border border-white/8 bg-white/3 backdrop-blur-3xl p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-500 ease-out"
    style="
      transform: {$isChatOpen ? 'scale(1)' : 'scale(0)'};
      opacity: {$isChatOpen ? '1' : '0'};
      transform-origin: {$blackholeOrigin.x}px {$blackholeOrigin.y}px;
    "
  >
    <ChatHeader />
    <SessionCard session={$activeSession} />
    <MessageFeed {messages} />
    <ChatInput bind:value={newMessageText} onSend={sendMessage} />
  </div>
</div>
