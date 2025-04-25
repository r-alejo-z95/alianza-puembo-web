"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

export default function InteractiveMap() {
  useEffect(() => {
    import("leaflet").then((L) => {
      const customIcon = L.icon({
        iconUrl: "/icons/church-icon.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      const map = L.map("map").setView([-0.1935895, -78.3646483], 17);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.marker([-0.1935895, -78.3646483], { icon: customIcon })
        .addTo(map)
        .bindPopup(
          "<b>Iglesia Alianza Puembo</b><br>Julio Tobar Donoso y 24 de Mayo"
        )
        .openPopup();
    });
  }, []);

  return (
    <div
      id="map"
      className="w-[280px] md:w-full aspect-[3/2] mx-auto rounded-lg"
    ></div>
  );
}
