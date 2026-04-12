import React, { useEffect, useState } from 'react';
import { PARTICLE_COLORS } from '../constants';
import { generateParticles, updateParticleAngle, calculateOrbitPosition } from '../utils/particles';
import type { ParticleConfig } from '../types';

interface OrbitParticlesProps {
  isActive: boolean;
  count?: number;
  radius?: number;
}

export const OrbitParticles: React.FC<OrbitParticlesProps> = ({
  isActive,
  count = 8,
  radius = 140,
}) => {
  const [particles, setParticles] = useState<ParticleConfig[]>([]);

  useEffect(() => {
    setParticles(generateParticles(count, radius));
  }, [count, radius]);

  useEffect(() => {
    if (!isActive) return;

    let animationId: number;
    const animate = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          angle: updateParticleAngle(p.angle, p.speed * 0.5),
        }))
      );
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isActive]);

  const tilt = -15;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle, index) => {
        const pos = calculateOrbitPosition(
          particle.angle,
          particle.distance,
          particle.distance * 0.5,
          tilt
        );

        return (
          <div
            key={particle.id}
            className="absolute left-1/2 top-1/2 rounded-full transition-opacity duration-300"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
              opacity: isActive ? particle.opacity : 0,
              boxShadow: `0 0 ${particle.size * 3}px ${PARTICLE_COLORS[index % PARTICLE_COLORS.length]}`,
            }}
          />
        );
      })}
    </div>
  );
};
