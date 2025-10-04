"use client";
import { useImpactStore } from "@/lib/store/impactStore";
import { useCallback } from "react";
import type { ImpactInputs } from "@/lib/physics/engine";

export function ControlsPanel() {
  const { state, setInputs, runSimulation, reset } = useImpactStore((s) => s);

  const onNumber = useCallback(
    (key: keyof ImpactInputs, min: number, max: number) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        if (!Number.isFinite(v)) return;
        setInputs({ [key]: Math.min(max, Math.max(min, v)) } as Partial<ImpactInputs>);
      },
    [setInputs]
  );

  return (
    <div className="w-full md:w-96 bg-white/80 dark:bg-black/40 backdrop-blur rounded-lg p-4 space-y-3 border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold">ChronosFlex Controls</h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="col-span-2 font-medium">Impact location</label>
        <div>
          <div className="text-xs mb-1">Latitude (°)</div>
          <input className="w-full input input-bordered px-2 py-1 rounded border"
            type="number" step="0.1" value={state.latitudeDeg}
            onChange={onNumber("latitudeDeg", -90, 90)} />
        </div>
        <div>
          <div className="text-xs mb-1">Longitude (°)</div>
          <input className="w-full input input-bordered px-2 py-1 rounded border"
            type="number" step="0.1" value={state.longitudeDeg}
            onChange={onNumber("longitudeDeg", -180, 180)} />
        </div>

        <label className="col-span-2 font-medium mt-2">Asteroid parameters</label>
        <div>
          <div className="text-xs mb-1">Diameter (m)</div>
          <input className="w-full px-2 py-1 rounded border"
            type="number" step="1" value={state.asteroidDiameterMeters}
            onChange={onNumber("asteroidDiameterMeters", 1, 100000)} />
        </div>
        <div>
          <div className="text-xs mb-1">Density (kg/m³)</div>
          <input className="w-full px-2 py-1 rounded border"
            type="number" step="50" value={state.asteroidDensityKgPerM3}
            onChange={onNumber("asteroidDensityKgPerM3", 500, 8000)} />
        </div>
        <div>
          <div className="text-xs mb-1">Speed (km/s)</div>
          <input className="w-full px-2 py-1 rounded border"
            type="number" step="0.5" value={state.impactSpeedKmPerS}
            onChange={onNumber("impactSpeedKmPerS", 1, 80)} />
        </div>
        <div>
          <div className="text-xs mb-1">Angle (°)</div>
          <input className="w-full px-2 py-1 rounded border"
            type="number" step="1" value={state.impactAngleDeg}
            onChange={onNumber("impactAngleDeg", 5, 90)} />
        </div>
        <div className="col-span-2">
          <div className="text-xs mb-1">Fragmentation (0-1)</div>
          <input className="w-full px-2 py-1 rounded border"
            type="number" step="0.05" value={state.fragmentationFactor ?? 0}
            onChange={onNumber("fragmentationFactor", 0, 1)} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={runSimulation} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Simulate</button>
        <button onClick={reset} className="px-3 py-2 rounded border">Reset</button>
      </div>

      {state.outputs && (
        <div className="pt-3 text-sm">
          <div className="font-medium mb-1">Results</div>
          <ul className="space-y-1">
            <li>Kinetic energy: {state.outputs.kineticEnergyJoules.toExponential(2)} J</li>
            <li>Crater diameter: {state.outputs.craterDiameterMeters.toFixed(0)} m</li>
            <li>Overpressure @1km: {state.outputs.overpressure_kPa_at_1km.toFixed(1)} kPa</li>
            <li>Thermal @1km: {state.outputs.thermalRadiation_kJ_per_m2_at_1km.toFixed(1)} kJ/m²</li>
            <li>Ejecta @10km: {state.outputs.ejectaThickness_mm_at_10km.toFixed(2)} mm</li>
          </ul>
          {state.outputs.notes.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs opacity-80">
              {state.outputs.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
