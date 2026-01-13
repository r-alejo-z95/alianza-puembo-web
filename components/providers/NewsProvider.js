'use client';

import { createContext, useContext } from 'react';
import { useNews } from '@/lib/hooks/useNews';

const AdminNewsContext = createContext();

export function NewsProvider({ children, initialNews }) {
    const newsData = useNews({ initialNews });

    return (
        <AdminNewsContext.Provider value={newsData}>
            {children}
        </AdminNewsContext.Provider>
    );
}

export function useAdminNewsContext() {
    const context = useContext(AdminNewsContext);
    if (!context) {
        throw new Error('useAdminNewsContext must be used within a NewsProvider');
    }
    return context;
}
