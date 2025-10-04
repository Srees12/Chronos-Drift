export type ImpactInputs = {
  latitudeDeg: number;
  longitudeDeg: number;
  asteroidDiameterMeters: number;
  asteroidDensityKgPerM3: number;
  impactSpeedKmPerS: number;
  impactAngleDeg: number; // 90 = vertical
  fragmentationFactor?: number; // 0..1 fraction of energy lost
};

export type ImpactOutputs = {
  kineticEnergyJoules: number;
  craterDiameterMeters: number;
  overpressure_kPa_at_1km: number;
  thermalRadiation_kJ_per_m2_at_1km: number;
  ejectaThickness_mm_at_10km: number;
  notes: string[];
};

const EARTH_GRAVITY = 9.80665; // m/s^2
const PI = Math.PI;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeImpact(inputs: ImpactInputs): ImpactOutputs {
  const radius = inputs.asteroidDiameterMeters / 2;
  const volume = (4 / 3) * PI * Math.pow(radius, 3);
  const mass = volume * inputs.asteroidDensityKgPerM3; // kg

  const speedMS = inputs.impactSpeedKmPerS * 1000; // m/s
  const angleRad = (inputs.impactAngleDeg * PI) / 180;
  const effectiveSpeed = speedMS * Math.sin(angleRad); // vertical component

  const fragmentationLoss = clamp(inputs.fragmentationFactor ?? 0.2, 0, 0.9);
  const kineticEnergy = 0.5 * mass * effectiveSpeed * effectiveSpeed * (1 - fragmentationLoss);

  // Pedagogical scaling relationships (not scientifically rigorous)
  const gravityTerm = Math.pow(kineticEnergy / (inputs.asteroidDensityKgPerM3 * EARTH_GRAVITY), 1 / 3);
  const craterDiameter = clamp(1.8 * Math.pow(gravityTerm, 0.8), 10, 200000); // 10 m to 200 km

  const overpressureAt1km = clamp(0.000015 * Math.pow(kineticEnergy, 0.55), 1, 3000); // kPa
  const thermalAt1km = clamp(0.0000008 * Math.pow(kineticEnergy, 0.6), 0.1, 20000); // kJ/m^2

  const ejectaAt10km = clamp(0.0002 * Math.pow(craterDiameter, 1.1), 0.01, 500); // mm

  const notes: string[] = [];
  if (inputs.impactAngleDeg < 20) notes.push("Shallow impact; long footprint and more downrange effects.");
  if (fragmentationLoss > 0.5) notes.push("Significant fragmentation reduces ground energy coupling.");
  if (craterDiameter > 2000) notes.push("Regional devastation expected.");

  return {
    kineticEnergyJoules: kineticEnergy,
    craterDiameterMeters: craterDiameter,
    overpressure_kPa_at_1km: overpressureAt1km,
    thermalRadiation_kJ_per_m2_at_1km: thermalAt1km,
    ejectaThickness_mm_at_10km: ejectaAt10km,
    notes,
  };
}
