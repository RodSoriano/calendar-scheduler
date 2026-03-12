'use client';

import { useState, useEffect } from 'react';
import { createEvent, type CreateEventPayload } from '@/lib/api';

interface EventModalProps {
  isOpen: boolean;
  initialStart: Date;
  initialEnd: Date;
  accessToken: string;
  onClose: () => void;
  onCreated: () => void;
}

interface FormState {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  timeZone: string;
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventModal({ isOpen, initialStart, initialEnd, accessToken, onClose, onCreated }: EventModalProps) {
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    location: '',
    startTime: toDatetimeLocal(initialStart),
    endTime: toDatetimeLocal(initialEnd),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      startTime: toDatetimeLocal(initialStart),
      endTime: toDatetimeLocal(initialEnd),
    }));
  }, [initialStart, initialEnd]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: CreateEventPayload = {
      title: form.title,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      timeZone: form.timeZone,
      description: form.description || undefined,
      location: form.location || undefined,
      source: 'APP',
    };

    try {
      await createEvent(accessToken, payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm p-2 w-full rounded-sm focus:outline-none focus:border-[#555]';
  const labelClass = 'block text-xs text-[#888888] mb-1';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#2a2a2a] p-6 w-full max-w-md rounded-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-white">New Event</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-white text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className={inputClass + ' resize-none'}
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start</label>
              <input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End</label>
              <input
                type="datetime-local"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Timezone</label>
            <input
              type="text"
              value={form.timeZone}
              onChange={(e) => setForm({ ...form, timeZone: e.target.value })}
              className={inputClass}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#888888] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs bg-white text-black rounded-sm hover:bg-[#e0e0e0] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
