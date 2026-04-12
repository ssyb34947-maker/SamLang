import type { CSSProperties } from 'react';

export function getSketchBorderStyle(
  width: number = 2,
  color: string = 'var(--sketch-border)'
): CSSProperties {
  return {
    border: `${width}px solid ${color}`,
    borderRadius: 'var(--wobbly-sm)',
    boxShadow: 'var(--shadow-hard)',
  };
}

export function getHandDrawnRotation(): number {
  return -2 + Math.random() * 4;
}

export function getPulseAnimationStyle(
  duration: number = 1500
): CSSProperties {
  return {
    animation: `sketch-pulse ${duration}ms ease-in-out infinite`,
  };
}

export function getOrbitAnimationStyle(
  duration: number = 8000
): CSSProperties {
  return {
    animation: `sketch-orbit ${duration}ms linear infinite`,
  };
}

export function getFadeInStyle(duration: number = 300): CSSProperties {
  return {
    animation: `sketch-fade-in ${duration}ms ease-out forwards`,
  };
}

export function getSlideUpStyle(duration: number = 300): CSSProperties {
  return {
    animation: `sketch-slide-up ${duration}ms ease-out forwards`,
  };
}

export function getScaleInStyle(duration: number = 300): CSSProperties {
  return {
    animation: `sketch-scale-in ${duration}ms ease-out forwards`,
  };
}
