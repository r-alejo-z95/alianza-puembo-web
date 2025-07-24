'use client';

import { PrayerWallSection } from "@/components/public/layout/pages/oracion/PrayerWallSection";
import { sectionTitle, sectionPy, contentSection, notAvailableText } from "@/lib/styles";
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
                {requests.length > 0 ? (
                    <PrayerWallSection requests={requests} />
                ) : (
                    <div className={contentSection}>
                        <p className={`${notAvailableText} !min-h-24`}>
                            No hay peticiones de oración para mostrar.
                        </p>
                    </div>
                )}
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