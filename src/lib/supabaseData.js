import { supabase, isSupabaseReady } from './supabaseClient';

const SITE_DATA_TABLE = 'site_data';
const SITE_DATA_ID = 1;
const EVENTS_TABLE = 'events';
const LOCAL_EVENTS_KEY = 'paroquia_events';

const safeJsonParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const readLocalEvents = () => {
  if (typeof window === 'undefined') return [];
  return safeJsonParse(localStorage.getItem(LOCAL_EVENTS_KEY), []);
};

const writeLocalEvents = (events) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
};

const normalizeEvent = (input) => ({
  title: input.title?.trim() || '',
  date: input.date || '',
  time: input.time || '',
  location: input.location || '',
  community: input.community?.trim() || '',
  category: input.category?.trim() || '',
  recurrence: input.recurrence?.trim() || '',
  description: input.description || '',
});

const createLocalId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const fetchSiteData = async () => {
  if (!isSupabaseReady) return null;
  const { data, error } = await supabase
    .from(SITE_DATA_TABLE)
    .select('data')
    .eq('id', SITE_DATA_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.data ?? null;
};

export const upsertSiteData = async (payload) => {
  if (!isSupabaseReady) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from(SITE_DATA_TABLE)
    .upsert({
      id: SITE_DATA_ID,
      data: payload,
      updated_at: new Date().toISOString(),
    })
    .select('data')
    .single();

  if (error) {
    throw error;
  }

  return data?.data ?? null;
};

export const loadEvents = async ({ useLocalFallback = true } = {}) => {
  const localEvents = readLocalEvents();

  if (!isSupabaseReady) {
    return { events: localEvents, synced: false };
  }

  try {
    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    const events = data || [];

    if (events.length > 0) {
      writeLocalEvents(events);
      return { events, synced: true };
    }

    if (localEvents.length > 0) {
      const insertPayload = localEvents.map((event) => normalizeEvent(event));
      const { data: inserted, error: insertError } = await supabase
        .from(EVENTS_TABLE)
        .insert(insertPayload)
        .select('*');

      if (!insertError && inserted?.length) {
        writeLocalEvents(inserted);
        return { events: inserted, synced: true };
      }
    }

    return { events: useLocalFallback ? localEvents : [], synced: true };
  } catch (error) {
    return {
      events: useLocalFallback ? localEvents : [],
      synced: false,
      error,
    };
  }
};

export const createEvent = async (input) => {
  const payload = normalizeEvent(input);

  if (!isSupabaseReady) {
    const localEvents = readLocalEvents();
    const newEvent = { id: createLocalId(), ...payload };
    const updated = [...localEvents, newEvent];
    writeLocalEvents(updated);
    return { event: newEvent, events: updated, synced: false };
  }

  try {
    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const localEvents = readLocalEvents().filter((event) => event.id !== data.id);
    const updated = [...localEvents, data];
    writeLocalEvents(updated);

    return { event: data, events: updated, synced: true };
  } catch (error) {
    const localEvents = readLocalEvents();
    const newEvent = { id: createLocalId(), ...payload };
    const updated = [...localEvents, newEvent];
    writeLocalEvents(updated);
    return { event: newEvent, events: updated, synced: false, error };
  }
};

export const updateEvent = async (id, input) => {
  const payload = normalizeEvent(input);

  if (!isSupabaseReady) {
    const localEvents = readLocalEvents();
    const updated = localEvents.map((event) =>
      event.id === id ? { ...event, ...payload } : event
    );
    const updatedEvent = updated.find((event) => event.id === id);
    writeLocalEvents(updated);
    return { event: updatedEvent, events: updated, synced: false };
  }

  try {
    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const updated = readLocalEvents().map((event) =>
      event.id === data.id ? data : event
    );
    writeLocalEvents(updated);
    return { event: data, events: updated, synced: true };
  } catch (error) {
    const localEvents = readLocalEvents();
    const updated = localEvents.map((event) =>
      event.id === id ? { ...event, ...payload } : event
    );
    const updatedEvent = updated.find((event) => event.id === id);
    writeLocalEvents(updated);
    return { event: updatedEvent, events: updated, synced: false, error };
  }
};

export const deleteEvent = async (id) => {
  let synced = false;
  let error;

  if (isSupabaseReady) {
    try {
      const { error: deleteError } = await supabase
        .from(EVENTS_TABLE)
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }
      synced = true;
    } catch (err) {
      error = err;
    }
  }

  const localEvents = readLocalEvents();
  const updated = localEvents.filter((event) => event.id !== id);
  writeLocalEvents(updated);

  return { events: updated, synced, error };
};
