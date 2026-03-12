const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Shape returned by GET /calendar/events (DB rows)
export interface DbEvent {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: string;
  endTime: string;
  timeZone: string;
  source: 'APP' | 'GOOGLE';
  googleEventId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
}

export interface CreateEventPayload {
  title: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  description?: string;
  location?: string;
  attendees?: string[];
  source?: 'APP' | 'GOOGLE';
}

export function mapToCalendarEvent(raw: DbEvent): CalendarEvent {
  return {
    title: raw.title,
    start: new Date(raw.startTime),
    end: new Date(raw.endTime),
  };
}

export async function fetchEvents(accessToken: string): Promise<DbEvent[]> {
  const res = await fetch(`${API_URL}/calendar/events`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json() as Promise<DbEvent[]>;
}

export async function syncEvents(accessToken: string): Promise<{ count: number }> {
  const res = await fetch(`${API_URL}/calendar/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json() as Promise<{ count: number }>;
}

export async function createEvent(accessToken: string, payload: CreateEventPayload): Promise<void> {
  const res = await fetch(`${API_URL}/calendar/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? 'Failed to create event');
  }
}

export async function logout(accessToken: string, refreshToken: string): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Refresh-Token': refreshToken,
    },
  });
}
