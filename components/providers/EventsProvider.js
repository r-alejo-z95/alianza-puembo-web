'use client';

import { createContext, useContext } from 'react';
import { useEvents } from '@/lib/hooks/useEvents';

const AdminEventsContext = createContext();

export function EventsProvider({ children, initialEvents }) {
    const eventsData = useEvents({ initialEvents });

    return (
        <AdminEventsContext.Provider value={eventsData}>
            {children}
        </AdminEventsContext.Provider>
    );
}

export function useAdminEventsContext() {
    const context = useContext(AdminEventsContext);
    if (!context) {
        throw new Error('useAdminEventsContext must be used within an EventsProvider');
    }
    return context;
}