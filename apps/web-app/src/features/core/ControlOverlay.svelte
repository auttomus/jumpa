<script lang="ts">
  import { 
    venues, 
    selectedVenue, 
    activeSession, 
    isChatOpen,
    selectVenue,
    startSession,
    updateSessionStatus
  } from '@/store/mapStore';
  import type { Venue } from '@/types';
  import AppBadge from '@/features/core/AppBadge.svelte';
  import ThemeToggle from '@/features/core/ThemeToggle.svelte';
  import SessionTracker from '@/features/session/SessionTracker.svelte';
  import VenuePanel from '@/features/venue/VenuePanel.svelte';
  import ChatFAB from '@/features/core/ChatFAB.svelte';

  function handleVenueClick(venue: Venue) {
    selectVenue(venue);
  }

  function handleStartSession() {
    if ($selectedVenue) {
      startSession(`Hangout at ${$selectedVenue.name}`, $selectedVenue.coordinates);
    }
  }

  function handleGoEnRoute() {
    updateSessionStatus('EN_ROUTE');
  }

  function handleEndSession() {
    activeSession.set(null);
  }
</script>

<div class="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 md:p-6">
  
  <!-- Top Bar: App Title and Status -->
  <div class="flex justify-between items-center pointer-events-auto">
    <div class="flex items-center gap-2">
      <AppBadge />
      <ThemeToggle />
    </div>
    <SessionTracker
      session={$activeSession}
      onGoEnRoute={handleGoEnRoute}
      onEndSession={handleEndSession}
    />
  </div>

  <!-- Bottom Area: Venue Browser & Chat FAB -->
  <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full pointer-events-auto relative">
    <VenuePanel
      venuesList={$venues}
      selectedVenue={$selectedVenue}
      activeSession={$activeSession}
      onVenueClick={handleVenueClick}
      onStartSession={handleStartSession}
    />
    <div class="absolute bottom-[240px] right-0 z-30 md:relative md:bottom-auto md:right-auto">
      <ChatFAB isChatOpen={$isChatOpen} />
    </div>
  </div>
</div>
