'use client';

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { btnStyles } from "@/lib/styles";
import { cn } from "@/lib/utils.ts";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

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
  const [showAppChoice, setShowAppChoice] = useState(false);
  const [originCoords, setOriginCoords] = useState(null);

  // Logic for Desktop (opens Google Maps web directly)
  const handleGetDirectionsDesktop = async () => {
    const destinationLat = markerPosition.lat;
    const destinationLng = markerPosition.lng;
    const webFallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      window.open(webFallbackUrl, "_blank", "noopener,noreferrer");
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
      window.open(webFallbackUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Logic for Mobile (shows app choice dialog immediately, geolocation happens in useEffect)
  const handleGetDirectionsMobile = () => {
    setShowAppChoice(true); // Show dialog immediately
  };

  // Effect to get geolocation when the dialog is opened
  useEffect(() => {
    if (showAppChoice) {
      // Reset originCoords when dialog opens to ensure fresh attempt
      setOriginCoords(null);

      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
      }

      const getPosition = async () => {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }); // Reduced timeout for quicker fallback
          });
          setOriginCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        } catch (error) {
          console.error("Error getting user location:", error.message);
          // If geolocation fails, originCoords remains null, which openMapApp handles
        }
      };
      getPosition();
    }
  }, [showAppChoice]);

  const openMapApp = (appType) => {
    setShowAppChoice(false); // Close dialog after selection
    const destinationLat = markerPosition.lat;
    const destinationLng = markerPosition.lng;

    let url = '';
    // If originCoords is null, it means geolocation failed or was not supported.
    // In this case, app links will fall back to web version.
    if (!originCoords || appType === 'web') {
      url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
      if (originCoords) {
        // If originCoords exist but user chose 'web', use them
        url = `https://www.google.com/maps/dir/${originCoords.latitude},${originCoords.longitude}/${destinationLat},${destinationLng}`;
      }
    } else {
      const originLat = originCoords.latitude;
      const originLng = originCoords.longitude;
      switch (appType) {
        case 'google':
          url = `comgooglemaps://?saddr=${originLat},${originLng}&daddr=${destinationLat},${destinationLng}&directionsmode=driving`;
          break;
        case 'waze':
          url = `waze://?ll=${destinationLat},${destinationLng}&navigate=yes`;
          break;
      }
    }
    window.open(url, "_blank", "noopener,noreferrer");
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

      <Dialog open={showAppChoice} onOpenChange={setShowAppChoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elige tu aplicación de mapas</DialogTitle>
            <DialogDescription>
              Selecciona cómo quieres obtener las indicaciones.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={() => openMapApp('google')}>Abrir en Google Maps App</Button>
            <Button onClick={() => openMapApp('waze')}>Abrir en Waze App</Button>
            <Button onClick={() => openMapApp('web')}>Abrir en el navegador</Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </APIProvider>
  );
}