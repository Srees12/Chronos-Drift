"use client";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import { useImpactStore } from "@/lib/store/impactStore";
import { useMemo } from "react";

export default function LeafletMapInner() {
  const { state, setInputs } = useImpactStore();

  useMapEvents({
    click(e: LeafletMouseEvent) {
      setInputs({ latitudeDeg: e.latlng.lat, longitudeDeg: e.latlng.lng });
    },
  });

  const craterRadiusMeters = useMemo(() => {
    if (!state.outputs) return 0;
    return state.outputs.craterDiameterMeters / 2;
  }, [state.outputs]);

  return (
    <MapContainer center={[state.latitudeDeg, state.longitudeDeg]} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[state.latitudeDeg, state.longitudeDeg]} />
      {state.outputs && craterRadiusMeters > 0 && (
        <Circle center={[state.latitudeDeg, state.longitudeDeg]} radius={craterRadiusMeters} pathOptions={{ color: "#ef4444", fillOpacity: 0.2 }} />
      )}
    </MapContainer>
  );
}
