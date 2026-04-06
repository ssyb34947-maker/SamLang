/**
 * 黑板组件
 * 显示数学公式，支持动画切换
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlackboardProps } from './types';
import { BLACKBOARD_STYLES } from './constants';
import { formulaVariants, blackboardContainerVariants, formulaItemVariants } from './animations';

export const Blackboard: React.FC<BlackboardProps> = ({
  formulas,
  currentIndex,
  width,
  height,
  x,
  y,
  onFormulaClick,
}) => {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const left = x - halfWidth;
  const top = y - halfHeight;

  // 获取当前显示的公式（最多3个）
  const getVisibleFormulas = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % formulas.length;
      result.push({
        ...formulas[index],
        position: i,
      });
    }
    return result;
  };

  const visibleFormulas = getVisibleFormulas();

  return (
    <motion.g
      className="lobster-blackboard"
      initial="hidden"
      animate="visible"
      variants={blackboardContainerVariants}
    >
      {/* 黑板外框 */}
      <rect
        x={left - 6}
        y={top - 6}
        width={width + 12}
        height={height + 18}
        rx={4}
        fill={BLACKBOARD_STYLES.frameColor}
      />

      {/* 黑板表面 */}
      <rect
        x={left}
        y={top}
        width={width}
        height={height}
        rx={2}
        className="lobster-blackboard__surface"
      />

      {/* 网格背景 */}
      <g opacity={0.3}>
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={left}
            y1={top + (height / 8) * i}
            x2={left + width}
            y2={top + (height / 8) * i}
            className="lobster-blackboard__grid"
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={left + (width / 10) * i}
            y1={top}
            x2={left + (width / 10) * i}
            y2={top + height}
            className="lobster-blackboard__grid"
          />
        ))}
      </g>

      {/* 粉笔槽 */}
      <rect
        x={left + 20}
        y={top + height - 2}
        width={width - 40}
        height={12}
        rx={2}
        className="lobster-blackboard__chalk-tray"
      />

      {/* 粉笔 */}
      <g transform={`translate(${left + 40}, ${top + height + 2})`}>
        <rect x={0} y={0} width={20} height={6} rx={1} fill="#FFFFFF" opacity={0.9} />
        <rect x={25} y={0} width={20} height={6} rx={1} fill="#FFD93D" opacity={0.9} />
        <rect x={50} y={0} width={20} height={6} rx={1} fill="#FF6B6B" opacity={0.9} />
      </g>

      {/* 公式显示区域 */}
      <g transform={`translate(${x}, ${top + 40})`}>
        <AnimatePresence mode="wait">
          {visibleFormulas.map((formula, index) => {
            const isMain = index === 0;
            const yOffset = isMain ? 0 : index === 1 ? 50 : 90;
            const opacity = isMain ? 1 : 0.6 - index * 0.2;
            const scale = isMain ? 1 : 0.85 - index * 0.1;

            return (
              <motion.g
                key={`${formula.id}-${currentIndex}`}
                variants={formulaItemVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={index}
                style={{
                  transformOrigin: 'center center',
                }}
                onClick={() => onFormulaClick?.(formula)}
                cursor={onFormulaClick ? 'pointer' : 'default'}
              >
                <motion.text
                  y={yOffset}
                  className={`lobster-blackboard__formula ${
                    isMain ? 'lobster-blackboard__formula--active' : 'lobster-blackboard__formula--secondary'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity,
                    y: yOffset,
                    scale,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: 'easeOut',
                  }}
                  style={{
                    fontSize: isMain ? 24 : 16,
                    filter: isMain ? 'drop-shadow(0 0 8px rgba(255, 217, 61, 0.6))' : 'none',
                  }}
                >
                  {formula.text}
                </motion.text>

                {/* 公式名称 */}
                {isMain && (
                  <motion.text
                    y={yOffset + 35}
                    className="lobster-blackboard__formula--secondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      fontSize: 12,
                      fontStyle: 'italic',
                    }}
                  >
                    — {formula.name}
                  </motion.text>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>
      </g>

      {/* 装饰性数学符号 */}
      <g opacity={0.15}>
        <text x={left + 30} y={top + 40} fill="#FFFFFF" fontSize={20} fontFamily="serif">
          ∑
        </text>
        <text x={left + width - 50} y={top + 50} fill="#FFFFFF" fontSize={24} fontFamily="serif">
          π
        </text>
        <text x={left + 40} y={top + height - 30} fill="#FFFFFF" fontSize={18} fontFamily="serif">
          √
        </text>
        <text x={left + width - 40} y={top + height - 40} fill="#FFFFFF" fontSize={20} fontFamily="serif">
          ∞
        </text>
      </g>
    </motion.g>
  );
};
