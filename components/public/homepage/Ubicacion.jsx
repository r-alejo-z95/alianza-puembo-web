'use client';

import { Youtube } from "lucide-react";
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils.ts";
import {
  sectionPx,
  secondaryTextSizes,
  subTitleSizes,
  secondSubTitleSizes,
} from "@/lib/styles.ts";
import { useEffect, useRef, useState } from "react";

const GoogleMapView = dynamic(() => import('@/components/public/map/InteractiveMap'), { ssr: false });

export default function Ubicacion({ youtubeStatus }) {
  const { videoUrl } = youtubeStatus;
  const sectionRef = useRef(null);
  const [showMap, setShowMap] = useState(false);
  const [mapIsLoaded, setMapIsLoaded] = useState(false);

  const handleMapLoad = () => {
    setMapIsLoaded(true);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowMap(true);
            observer.disconnect(); // Stop observing once it's in view
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="ubicacion" ref={sectionRef} className={cn(sectionPx, "w-full h-[50%] py-16")}>
      <div className="mx-auto flex flex-col gap-8">
        <h2
          className={cn(
            subTitleSizes,
            "text-center font-merriweather font-bold"
          )}
        >
          ¡Queremos conocerte! Visítanos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-0 w-full mx-auto">
          <div className="overflow-scroll">
            {showMap && <GoogleMapView onMapLoad={handleMapLoad} />}
          </div>
          <div className="flex flex-col gap-4 md:gap-8 justify-center items-center text-center">
            <div className="flex flex-col md:gap-4">
              <p
                className={cn(
                  secondSubTitleSizes,
                  "font-merriweather font-bold"
                )}
              >
                10:00 | 12:00
              </p>
              <p className={cn(secondaryTextSizes)}>Servicios dominicales</p>
            </div>
            <div className="flex flex-col md:gap-4">
              <p
                className={cn(
                  secondSubTitleSizes,
                  "font-merriweather font-bold"
                )}
              >
                10:00
              </p>
              <div className="flex items-center gap-2">
                <p className={cn(secondaryTextSizes)}>Servicio online</p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Youtube channel"
                >
                  <Youtube className="size-7 text-red-500 hover:text-red-600 transition-colors" />
                </a>
              </div>
            </div>
            <div className="flex flex-col md:gap-2">
              <p className={cn(secondaryTextSizes)}>
                Julio Tobar Donoso y 24 de Mayo
              </p>
              <p className={cn(secondaryTextSizes)}>Puembo, Ecuador</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}