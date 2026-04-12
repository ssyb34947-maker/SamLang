import type { AnimationConfig } from '../types';

export const ANIMATION_CONFIG: AnimationConfig = {
  pulseDuration: 1500,
  orbitDuration: 8000,
  transitionDuration: 300,
  particleCount: 6,
};

export const ORBIT_CONFIG = {
  radiusX: 80,
  radiusY: 40,
  tilt: -15,
};

export const PARTICLE_COLORS = [
  'var(--sketch-accent)',
  'var(--sketch-secondary)',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
];

export const STAGGER_DELAY = 100;

export const TOOL_HIGHLIGHT_DURATION = 2000;

export const COMPLETION_ANIMATION_DURATION = 600;
