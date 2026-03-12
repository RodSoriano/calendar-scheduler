'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getRefreshToken, clearTokens } from '@/lib/auth';
import { fetchEvents, syncEvents, mapToCalendarEvent, logout, type CalendarEvent } from '@/lib/api';
import CalendarView from '@/components/CalendarView';
import EventModal from '@/components/EventModal';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [slotStart, setSlotStart] = useState(new Date());
  const [slotEnd, setSlotEnd] = useState(new Date());

  async function loadEvents(token: string) {
    setLoading(true);
    const raw = await fetchEvents(token);
    setEvents(raw.map(mapToCalendarEvent));
    setLoading(false);
  }

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/');
      return;
    }
    setAccessToken(token);
    loadEvents(token);
  }, [router]);

  function handleSelectSlot(start: Date, end: Date) {
    setSlotStart(start);
    setSlotEnd(end);
    setModalOpen(true);
  }

  async function handleSync() {
    if (!accessToken) return;
    setSyncing(true);
    await syncEvents(accessToken);
    await loadEvents(accessToken);
    setSyncing(false);
  }

  async function handleLogout() {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    if (access && refresh) {
      await logout(access, refresh);
    }
    clearTokens();
    router.push('/');
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <h1 className="text-sm font-medium text-white">Calendar Scheduler</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            className="text-xs text-[#888888] hover:text-white transition-colors disabled:opacity-40"
          >
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-[#888888] hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-6 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <CalendarView events={events} onSelectSlot={handleSelectSlot} />
        )}
      </main>

      <EventModal
        isOpen={modalOpen}
        initialStart={slotStart}
        initialEnd={slotEnd}
        accessToken={accessToken}
        onClose={() => setModalOpen(false)}
        onCreated={() => loadEvents(accessToken)}
      />
    </div>
  );
}
