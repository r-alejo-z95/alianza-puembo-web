'use client';

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { btnStyles } from "@/lib/styles";
import { cn } from "@/lib/utils.ts";
import Image from "next/image";

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