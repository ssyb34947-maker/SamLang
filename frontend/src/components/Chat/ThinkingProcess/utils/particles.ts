import type { ParticleConfig } from '../types';

export function generateParticles(count: number, radius: number = 60): ParticleConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `particle-${i}-${Date.now()}`,
    angle: (360 / count) * i,
    distance: radius * (0.6 + Math.random() * 0.4),
    speed: 0.3 + Math.random() * 0.4,
    size: 4 + Math.random() * 4,
    opacity: 0.4 + Math.random() * 0.4,
  }));
}

export function updateParticleAngle(angle: number, speed: number): number {
  return (angle + speed) % 360;
}

export function calculateOrbitPosition(
  angle: number,
  radiusX: number,
  radiusY: number,
  tilt: number
): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  const tiltRad = (tilt * Math.PI) / 180;

  const x = Math.cos(rad) * radiusX;
  const y = Math.sin(rad) * radiusY;

  const rotatedX = x * Math.cos(tiltRad) - y * Math.sin(tiltRad);
  const rotatedY = x * Math.sin(tiltRad) + y * Math.cos(tiltRad);

  return { x: rotatedX, y: rotatedY };
}

export function generateSparkles(count: number): Array<{
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}> {
  return Array.from({ length: count }, (_, i) => ({
    id: `sparkle-${i}-${Date.now()}`,
    x: -50 + Math.random() * 100,
    y: -50 + Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 2000,
    duration: 1000 + Math.random() * 1000,
  }));
}
