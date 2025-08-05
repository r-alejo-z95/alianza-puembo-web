'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const ClientEventsContext = createContext();

export function ClientEventsProvider({ children, initialEvents = [] }) {
    const [events, setEvents] = useState(initialEvents);
    const [loading, setLoading] = useState(!initialEvents.length);

    const supabase = createClient();

    const fetchEvents = async () => {
        if (!loading) setLoading(true);

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching events:', error);
            toast.error('Error al cargar los eventos.');
        } else {
            setEvents(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        // Solo hacer fetch si no tenemos eventos iniciales
        if (!initialEvents.length) {
            fetchEvents();
        }
    }, []);

    // Transform events for calendar format
    const calendarEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(event.start_time),
        end: event.end_time ? new Date(event.end_time) : new Date(event.start_time),
        allDay: event.all_day || false,
        color: event.color || 'sky',
        location: event.location,
        originalEvent: event
    }));

    const value = {
        events,
        calendarEvents,
        loading,
        refetchEvents: fetchEvents
    };

    return (
        <ClientEventsContext.Provider value={value}>
            {children}
        </ClientEventsContext.Provider>
    );
}

export function useClientEventsContext() {
    const context = useContext(ClientEventsContext);
    if (!context) {
        throw new Error('useClientEventsContext must be used within a ClientEventsProvider');
    }
    return context;
}