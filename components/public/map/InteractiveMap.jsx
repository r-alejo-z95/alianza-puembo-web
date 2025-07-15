'use client';

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { btnStyles } from "@/lib/styles";
import { cn } from "@/lib/utils.ts";

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

export default function GoogleMapView() {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["marker"]}>
      <div className="w-[280px] md:w-full aspect-[3/2] mx-auto rounded-md overflow-hidden flex">
        <Map
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID} // Reemplaza con tu Map ID de Google Cloud Console
          defaultCenter={centerMap}
          defaultZoom={18}
          disableDefaultUI={true}
          mapContainerStyle={containerStyle}
        >
          <AdvancedMarker position={markerPosition}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 4 }}
            >
              <img src="/icons/church-icon.png" alt="Church Icon" style={{ width: '36px', height: '36px' }} />
            </motion.div>
          </AdvancedMarker>
        </Map>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=Iglesia+Alianza+Puembo`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute mt-4 ml-4 xl:mt-6 xl:ml-6"
        >
          <Button className={cn(btnStyles)}>Cómo llegar</Button>
        </a>
      </div>
    </APIProvider>
  );
}