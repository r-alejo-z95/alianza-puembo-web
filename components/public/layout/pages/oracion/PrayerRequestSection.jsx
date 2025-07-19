'use client';

import { PrayerWallSection } from "@/components/public/layout/pages/oracion/PrayerWallSection";
import { sectionTitle, sectionPy } from "@/lib/styles";
import { addPrayerRequest } from '@/lib/actions';
import dynamic from 'next/dynamic';

const PrayerRequestForm = dynamic(() => import('@/components/public/forms/PrayerRequestForm'), { ssr: false });

export function PrayerRequestSection({ requests }) {
    return (
        <div>
            <div className="bg-white p-8 max-w-6xl mx-auto pb-16 md:pb-24">
                <h2 className={`${sectionTitle} mb-4 text-(--puembo-green) text-center`}>
                    Peticiones de Oración
                </h2>
                <PrayerWallSection requests={requests} />
            </div>
            <div className="bg-(--puembo-green) text-gray-800">
                <div className={`flex justify-center ${sectionPy}`}>
                    <div className="p-8 max-w-2xl mx-auto">
                        <PrayerRequestForm action={addPrayerRequest} />
                    </div>
                </div>
            </div>
        </div>
    );
}