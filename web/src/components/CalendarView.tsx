'use client';

import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useState } from 'react';
import type { CalendarEvent } from '@/lib/api';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectSlot: (start: Date, end: Date) => void;
}

export default function CalendarView({ events, onSelectSlot }: CalendarViewProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  return (
    <div className="h-[calc(100vh-80px)]">
      <Calendar
        localizer={localizer}
        events={events}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        selectable
        onSelectSlot={(slotInfo) => onSelectSlot(slotInfo.start, slotInfo.end)}
        style={{ height: '100%' }}
      />
    </div>
  );
}
