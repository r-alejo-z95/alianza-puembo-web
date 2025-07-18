'use client';

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { btnStyles } from "@/lib/styles";
import { cn } from "@/lib/utils.ts";
import Image from "next/image";
import { motion } from "framer-motion";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.75rem",
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
  const destinationLat = markerPosition.lat;
  const destinationLng = markerPosition.lng;
  const destinationLabel = "Iglesia Alianza Puembo";
  const fallbackWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}`;

  // Logic for Desktop (opens Google Maps web directly)
  const handleGetDirectionsDesktop = async () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      const { latitude, longitude } = position.coords;
      const mapsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${destinationLat},${destinationLng}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error getting user location:", error.message);
      window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Logic for Mobile (uses geo: URL scheme to trigger OS app chooser)
  const handleGetDirectionsMobile = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const geoUrl = `geo:${destinationLat},${destinationLng}?q=${destinationLat},${destinationLng}(${encodeURIComponent(destinationLabel)})`;

    if (isMobile) {
      // Open native maps app
      window.location.href = geoUrl;
    } else {
      // Fallback for non-mobile or failed detection
      window.open(fallbackWebUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["marker"]}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="w-[280px] md:w-full aspect-[3/2] mx-auto rounded-md overflow-hidden flex"
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
        <div className="absolute mt-4 ml-4 xl:mt-6 xl:ml-6">
          {/* Desktop Button */}
          <Button
            className={cn(btnStyles, "hidden lg:flex")}
            onClick={handleGetDirectionsDesktop}
          >
            Cómo llegar
          </Button>
          {/* Mobile Button */}
          <Button
            className={cn(btnStyles, "lg:hidden")}
            onClick={handleGetDirectionsMobile}
          >
            Cómo llegar
          </Button>
        </div>
      </motion.div>
    </APIProvider>
  );
}