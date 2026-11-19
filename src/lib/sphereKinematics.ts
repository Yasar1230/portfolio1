/**
 * Pure kinematic calculations for the internal-pendulum spherical robot visual.
 * Decoupled from Three.js so math invariants remain fast and unit-testable.
 */

export interface SphereKinematicsInput {
  elapsedSeconds: number;
  scrollProgress: number; // 0..1
  pointerX: number; // -1..1
  pointerY: number; // -1..1
  reducedMotion: boolean;
}

export interface SphereKinematicsTargets {
  shellPitchX: number;
  shellYawY: number;
  pendulumSwingZ: number;
  pendulumPitchX: number;
  driveShaftSpinX: number;
  degreeReadout: number;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Frame-rate independent exponential damping helper.
 */
export function dampValue(
  current: number,
  target: number,
  lambda: number,
  deltaSeconds: number,
): number {
  const safeDelta = clampNumber(deltaSeconds, 0, 0.1);
  const factor = 1 - Math.exp(-lambda * safeDelta);
  return current + (target - current) * factor;
}

/**
 * Computes physically grounded target angles for a spherical shell driven
 * by an internal counterweight pendulum mounted on a central shaft.
 */
export function computeSphereKinematics(
  input: SphereKinematicsInput,
): SphereKinematicsTargets {
  const scroll = clampNumber(input.scrollProgress, 0, 1);
  const px = clampNumber(input.pointerX, -1, 1);
  const py = clampNumber(input.pointerY, -1, 1);

  if (input.reducedMotion) {
    const restingSwing = 0.22;
    return {
      shellPitchX: 0.18,
      shellYawY: 0.42 + scroll * 0.35,
      pendulumSwingZ: restingSwing,
      pendulumPitchX: -0.08,
      driveShaftSpinX: scroll * Math.PI * 0.5,
      degreeReadout: Math.round((restingSwing * 180) / Math.PI),
    };
  }

  const t = input.elapsedSeconds;
  // Smooth pendulum torque oscillation coupled with pointer lean
  const pendulumSwingZ =
    Math.sin(t * 1.15) * 0.34 + px * 0.28 + Math.sin(scroll * Math.PI * 2) * 0.12;
  const pendulumPitchX = Math.cos(t * 0.85) * 0.18 - py * 0.22;

  // Outer shell rotates gently in response to internal counterweight shift and scroll
  const shellYawY = t * 0.18 + scroll * Math.PI * 1.4 + px * 0.35;
  const shellPitchX = 0.16 + Math.sin(t * 0.55) * 0.08 + py * 0.2;

  // Central shaft rotates smoothly around the axle
  const driveShaftSpinX = t * 0.45 + scroll * Math.PI * 2;

  const degreeReadout = Math.round(((pendulumSwingZ * 180) / Math.PI) * 10) / 10;

  return {
    shellPitchX,
    shellYawY,
    pendulumSwingZ,
    pendulumPitchX,
    driveShaftSpinX,
    degreeReadout,
  };
}

/**
 * Computes hemisphere axial separation for cutaway / exploded inspection mode.
 */
export function computeCutawaySeparation(
  exploded: boolean,
  currentOffset: number,
  deltaSeconds: number,
): number {
  const target = exploded ? 0.44 : 0;
  return dampValue(currentOffset, target, 6.5, deltaSeconds);
}
