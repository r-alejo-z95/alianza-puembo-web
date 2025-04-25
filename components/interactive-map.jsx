"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

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
    <div className="w-[280px] md:w-full aspect-[3/2] mx-auto">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centerMap}
        zoom={18}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </div>
  );
}
