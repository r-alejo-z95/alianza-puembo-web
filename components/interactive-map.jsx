"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Button } from "./ui/button";
import { landingPageBtnStyles } from "@/lib/styles";
import { cn } from "@/lib/utils";

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

const customMapStyle = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "water",
    stylers: [{ color: "#c9c9c9" }],
  },
];

export default function GoogleMapView() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded)
    return (
      <div className="flex">
        <p className="text-center font-bold mx-auto my-auto">
          Cargando mapa...
        </p>
      </div>
    );

  return (
    <div>
      <div className="w-[280px] md:w-full aspect-[3/2] mx-auto rounded-lg overflow-hidden flex">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={centerMap}
          zoom={18}
          options={{ styles: customMapStyle, disableDefaultUI: true }}
        >
          <Marker
            position={markerPosition}
            icon={{
              url: "/icons/church-icon.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        </GoogleMap>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${markerPosition.lat},${markerPosition.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute mt-4 ml-4"
        >
          <Button className={cn(landingPageBtnStyles)}>Cómo llegar</Button>
        </a>
      </div>
    </div>
  );
}
