import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeImpact, ImpactInputs, ImpactOutputs } from "@/lib/physics/engine";

export type ImpactState = ImpactInputs & {
  outputs: ImpactOutputs | null;
};

type ImpactStore = {
  state: ImpactState;
  setInputs: (partial: Partial<ImpactInputs>) => void;
  runSimulation: () => void;
  reset: () => void;
};

const defaultInputs: ImpactInputs = {
  latitudeDeg: 0,
  longitudeDeg: 0,
  asteroidDiameterMeters: 100,
  asteroidDensityKgPerM3: 3000,
  impactSpeedKmPerS: 20,
  impactAngleDeg: 45,
  fragmentationFactor: 0.2,
};

export const useImpactStore = create<ImpactStore>()(
  persist(
    (set, get) => ({
      state: { ...defaultInputs, outputs: null },
      setInputs: (partial) => set(({ state }) => ({ state: { ...state, ...partial } })),
      runSimulation: () => {
        const { state } = get();
        const inputs = {
          latitudeDeg: state.latitudeDeg,
          longitudeDeg: state.longitudeDeg,
          asteroidDiameterMeters: state.asteroidDiameterMeters,
          asteroidDensityKgPerM3: state.asteroidDensityKgPerM3,
          impactSpeedKmPerS: state.impactSpeedKmPerS,
          impactAngleDeg: state.impactAngleDeg,
          fragmentationFactor: state.fragmentationFactor,
        } satisfies ImpactInputs;
        const result = computeImpact(inputs);
        set(({ state }) => ({ state: { ...state, outputs: result } }));
      },
      reset: () => set({ state: { ...defaultInputs, outputs: null } }),
    }),
    { name: "chronosflex-impact" }
  )
);
