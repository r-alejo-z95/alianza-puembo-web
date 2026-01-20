"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils.ts";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const centerMap = {
  lat: -0.193756,
  lng: -78.363887,
};

const markerPosition = {
  lat: -0.1940832557785033,
  lng: -78.36375798200926,
};

export default function GoogleMapView({ onMapLoad }) {
  const destinationLabel = "Iglesia Alianza Puembo";
  const encodedLabel = encodeURIComponent(destinationLabel);
  const fallbackWebUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLabel}`;

  const handleGetDirections = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const geoUrl = `geo:0,0?q=${encodedLabel}`;
      window.location.href = geoUrl;
    } else {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        });
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodedLabel}`;
        window.open(mapsUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error("Error getting user location:", error.message);
        window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={["marker"]}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative w-full h-full flex"
      >
        <Map
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
          defaultCenter={centerMap}
          defaultZoom={18}
          disableDefaultUI={true}
          mapContainerStyle={containerStyle}
          onLoad={onMapLoad}
        >
          <AdvancedMarker position={markerPosition}>
            <Image
              src="/icons/church-icon.png"
              alt="Church Icon"
              width={36}
              height={36}
              sizes="(max-width: 768px) 10vw, (max-width: 1200px) 10vw, 10vw"
              quality={100}
            />
          </AdvancedMarker>
        </Map>

        {/* Botón Flotante Coherente con Hero/Grupos */}
        <div className="absolute top-8 left-8">
          <Button
            variant="green"
            size="xl"
            className="rounded-full px-6 py-3 font-bold shadow-lg shadow-(--puembo-green)/20 flex items-center gap-2 h-auto"
            onClick={handleGetDirections}
          >
            <Navigation className="w-5 h-5" />
            Como llegar
          </Button>
        </div>
      </motion.div>
    </APIProvider>
  );
}
