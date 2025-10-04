"use client";
import dynamic from "next/dynamic";

const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), { ssr: false });

export function MapView() {
  return (
    <div className="w-full h-[60vh] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <LeafletMapInner />
    </div>
  );
}
