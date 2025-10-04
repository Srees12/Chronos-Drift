"use client";
import { useMapEvents } from "react-leaflet";

type Props = { onClick: (lat: number, lng: number) => void };

export default function MapEvents({ onClick }: Props) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}
