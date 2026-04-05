import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface LoadingProps {
  isVisible: boolean;
}

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  phase: number;
  opacity: number;
}

/**
 * 全局加载动画组件
 * 使用createPortal挂载到body，实现全屏动画效果
 * 物理真实的水滴摆动动画 - 大量水滴在容器内根据物理定律运动
 */
export const Loading: React.FC<LoadingProps> = ({ isVisible }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dropletsRef = useRef<Droplet[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 初始化水滴
    const initDroplets = () => {
      const droplets: Droplet[] = [];
      const dropletCount = 45;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < dropletCount; i++) {
        const angle = (Math.PI * 2 * i) / dropletCount;
        const radius = 25 + Math.random() * 35;
        const size = 3 + Math.random() * 6;

        droplets.push({
          x: centerX + Math.cos(angle) * radius * 0.3,
          y: centerY + Math.sin(angle) * radius * 0.3 + 60,
          vx: 0,
          vy: 0,
          radius: size,
          mass: size * 0.15,
          phase: Math.random() * Math.PI * 2,
          opacity: 0.4 + Math.random() * 0.5,
        });
      }
      dropletsRef.current = droplets;
    };
    initDroplets();

    // 物理参数
    const GRAVITY = 0.15;
    const CONTAINER_WIDTH = 100;
    const CONTAINER_HEIGHT = 140;
    const DAMPING = 0.985;
    const TILT_AMPLITUDE = 0.18;
    const TILT_FREQUENCY = 0.002;

    // 绘制水滴
    const drawDroplet = (ctx: CanvasRenderingContext2D, droplet: Droplet, tiltAngle: number) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 20;

      // 应用倾斜变换
      const relX = droplet.x - centerX;
      const relY = droplet.y - centerY;
      const rotatedX = relX * Math.cos(tiltAngle) - relY * Math.sin(tiltAngle);
      const rotatedY = relX * Math.sin(tiltAngle) + relY * Math.cos(tiltAngle);

      const screenX = centerX + rotatedX;
      const screenY = centerY + rotatedY;

      // 水滴主体 - 使用渐变模拟水的质感
      const gradient = ctx.createRadialGradient(
        screenX - droplet.radius * 0.3,
        screenY - droplet.radius * 0.3,
        0,
        screenX,
        screenY,
        droplet.radius
      );
      gradient.addColorStop(0, `rgba(200, 255, 255, ${droplet.opacity + 0.3})`);
      gradient.addColorStop(0.3, `rgba(0, 230, 255, ${droplet.opacity})`);
      gradient.addColorStop(0.7, `rgba(0, 180, 220, ${droplet.opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(0, 120, 180, ${droplet.opacity * 0.5})`);

      ctx.beginPath();
      ctx.arc(screenX, screenY, droplet.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 高光效果
      ctx.beginPath();
      ctx.arc(
        screenX - droplet.radius * 0.35,
        screenY - droplet.radius * 0.35,
        droplet.radius * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * droplet.opacity})`;
      ctx.fill();

      // 小高光点
      ctx.beginPath();
      ctx.arc(
        screenX - droplet.radius * 0.2,
        screenY - droplet.radius * 0.2,
        droplet.radius * 0.1,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
    };

    // 绘制容器
    const drawContainer = (ctx: CanvasRenderingContext2D, tiltAngle: number) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 20;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(tiltAngle);

      // 容器外框
      ctx.beginPath();
      ctx.roundRect(-CONTAINER_WIDTH / 2, -CONTAINER_HEIGHT / 2, CONTAINER_WIDTH, CONTAINER_HEIGHT, 8);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 容器发光效果
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 容器内部渐变
      const containerGradient = ctx.createLinearGradient(
        -CONTAINER_WIDTH / 2,
        -CONTAINER_HEIGHT / 2,
        CONTAINER_WIDTH / 2,
        CONTAINER_HEIGHT / 2
      );
      containerGradient.addColorStop(0, 'rgba(0, 255, 255, 0.08)');
      containerGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.04)');
      containerGradient.addColorStop(1, 'rgba(0, 150, 255, 0.08)');
      ctx.fillStyle = containerGradient;
      ctx.fill();

      // 容器盖子
      ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
      ctx.fillRect(-20, -CONTAINER_HEIGHT / 2 - 12, 40, 12);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-20, -CONTAINER_HEIGHT / 2 - 12, 40, 12);

      ctx.restore();
    };

    // 更新物理
    const updatePhysics = (tiltAngle: number) => {
      const droplets = dropletsRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 20;

      // 计算重力方向（根据倾斜角度）
      const gravityX = Math.sin(tiltAngle) * GRAVITY;
      const gravityY = Math.cos(tiltAngle) * GRAVITY;

      droplets.forEach((droplet, i) => {
        // 应用重力
        droplet.vx += gravityX;
        droplet.vy += gravityY;

        // 添加波浪扰动（模拟液体波动）
        const waveForce = Math.sin(timeRef.current * 0.003 + droplet.phase) * 0.02;
        droplet.vx += waveForce * Math.cos(tiltAngle);
        droplet.vy += waveForce * Math.sin(tiltAngle);

        // 中心恢复力（保持水滴群聚集）
        const dx = droplet.x - centerX;
        const dy = droplet.y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(CONTAINER_WIDTH, CONTAINER_HEIGHT) * 0.35;

        if (distFromCenter > maxDist) {
          const restoreForce = (distFromCenter - maxDist) * 0.015;
          droplet.vx -= (dx / distFromCenter) * restoreForce;
          droplet.vy -= (dy / distFromCenter) * restoreForce;
        }

        // 水滴间相互作用（简化的液体压力模拟）
        droplets.forEach((other, j) => {
          if (i === j) return;
          const dx = other.x - droplet.x;
          const dy = other.y - droplet.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = droplet.radius + other.radius;

          if (dist < minDist && dist > 0) {
            const overlap = minDist - dist;
            const force = overlap * 0.08;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            droplet.vx -= fx / droplet.mass;
            droplet.vy -= fy / droplet.mass;
          }
        });

        // 容器边界碰撞
        const halfWidth = CONTAINER_WIDTH / 2 - droplet.radius - 4;
        const halfHeight = CONTAINER_HEIGHT / 2 - droplet.radius - 4;

        // 将坐标旋转到容器坐标系进行边界检测
        const relX = droplet.x - centerX;
        const relY = droplet.y - centerY;
        const rotatedX = relX * Math.cos(-tiltAngle) - relY * Math.sin(-tiltAngle);
        const rotatedY = relX * Math.sin(-tiltAngle) + relY * Math.cos(-tiltAngle);

        let bounced = false;
        if (rotatedX < -halfWidth) {
          const penetration = -halfWidth - rotatedX;
          droplet.vx += Math.cos(tiltAngle) * penetration * 0.1;
          droplet.vy += Math.sin(tiltAngle) * penetration * 0.1;
          bounced = true;
        } else if (rotatedX > halfWidth) {
          const penetration = rotatedX - halfWidth;
          droplet.vx -= Math.cos(tiltAngle) * penetration * 0.1;
          droplet.vy -= Math.sin(tiltAngle) * penetration * 0.1;
          bounced = true;
        }

        if (rotatedY < -halfHeight) {
          const penetration = -halfHeight - rotatedY;
          droplet.vx -= Math.sin(tiltAngle) * penetration * 0.1;
          droplet.vy += Math.cos(tiltAngle) * penetration * 0.1;
          bounced = true;
        } else if (rotatedY > halfHeight) {
          const penetration = rotatedY - halfHeight;
          droplet.vx += Math.sin(tiltAngle) * penetration * 0.1;
          droplet.vy -= Math.cos(tiltAngle) * penetration * 0.1;
          bounced = true;
        }

        if (bounced) {
          droplet.vx *= 0.7;
          droplet.vy *= 0.7;
        }

        // 阻尼
        droplet.vx *= DAMPING;
        droplet.vy *= DAMPING;

        // 更新位置
        droplet.x += droplet.vx;
        droplet.y += droplet.vy;
      });
    };

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      timeRef.current += 16;

      // 计算容器倾斜角度（正弦摆动）
      const tiltAngle = Math.sin(timeRef.current * TILT_FREQUENCY) * TILT_AMPLITUDE;

      // 更新物理
      updatePhysics(tiltAngle);

      // 绘制容器背景
      drawContainer(ctx, tiltAngle);

      // 按Y坐标排序绘制（实现简单的深度效果）
      const sortedDroplets = [...dropletsRef.current].sort((a, b) => a.y - b.y);
      sortedDroplets.forEach(droplet => drawDroplet(ctx, droplet, tiltAngle));

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible]);

  // 如果不可见，直接返回null
  if (!isVisible) {
    return null;
  }

  // 使用createPortal将组件挂载到body
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center loading-overlay">
      <div className="loading-content">
        <div className="water-droplets-container">
          <canvas ref={canvasRef} className="droplets-canvas" />
        </div>
        <div className="loading-text pixel-loading-text neon-text-primary">
          加载中...
        </div>
      </div>
    </div>,
    document.body
  );
};

// 纯CSS动画样式
const style = document.createElement('style');
style.textContent = `
  .loading-overlay {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .water-droplets-container {
    position: relative;
    width: 280px;
    height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .droplets-canvas {
    width: 100%;
    height: 100%;
  }

  .loading-text {
    margin-top: 30px;
    font-size: 1.5rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 3px;
    animation: textPulse 2s ease-in-out infinite;
  }

  @keyframes textPulse {
    0%, 100% {
      opacity: 0.7;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.02);
    }
  }

  /* 响应式适配 */
  @media (max-width: 640px) {
    .water-droplets-container {
      width: 220px;
      height: 260px;
    }

    .loading-text {
      font-size: 1.2rem;
      margin-top: 24px;
      letter-spacing: 2px;
    }
  }

  @media (max-width: 480px) {
    .water-droplets-container {
      width: 180px;
      height: 200px;
    }

    .loading-text {
      font-size: 1rem;
      margin-top: 20px;
      letter-spacing: 1px;
    }
  }
`;
document.head.appendChild(style);
