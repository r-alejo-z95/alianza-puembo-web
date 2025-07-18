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

const destination = "Iglesia+Alianza+Puembo"

export default function GoogleMapView({ onMapLoad }) {
  const handleGetDirections = async () => {
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error getting user location:", error.message);
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["marker"]}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="w-[280px] md:w-full aspect-[3/2] mx-auto rounded-md overflow-hidden flex"
      >
        <Map
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID} // Reemplaza con tu Map ID de Google Cloud Console
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
          <Button className={cn(btnStyles)} onClick={handleGetDirections}>
            Cómo llegar
          </Button>
        </div>
      </motion.div>
    </APIProvider>
  );
}