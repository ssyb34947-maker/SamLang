# 龙虾教授组件 (LobsterProfessor)

一个基于 OpenClaw 龙虾形象的教授角色组件，手持平板、指向黑板，展示数学公式。

## 特性

- 🦞 红橘黄色调的龙虾形象
- 📱 左手持平板（电子书）
- 👆 右手指向黑板
- 🎓 背后电子黑板显示数学公式
- ✨ 丰富的教学动画（指向、讲解、思考、强调）
- 🎨 高度解耦的架构设计
- 📐 每个文件不超过 200 行

## 文件结构

```
LobsterProfessor/
├── index.ts              # 统一入口，导出所有 API
├── types.ts              # TypeScript 类型定义
├── constants.ts          # 常量配置（颜色、尺寸、公式）
├── animations.ts         # 动画变体配置
├── LobsterProfessor.css  # 样式文件
├── LobsterProfessor.tsx  # 主组件
├── LobsterParts.tsx      # SVG 部件组件
└── Blackboard.tsx        # 黑板组件
```

## 使用方法

### 基础用法

```tsx
import { LobsterProfessor } from './components/LobsterProfessor';

function App() {
  return <LobsterProfessor />;
}
```

### 自定义公式

```tsx
import { LobsterProfessor, Formula } from './components/LobsterProfessor';

const customFormulas: Formula[] = [
  { id: '1', text: 'E = mc²', name: '质能方程' },
  { id: '2', text: 'F = ma', name: '牛顿第二定律' },
];

function App() {
  return (
    <LobsterProfessor
      formulas={customFormulas}
      formulaInterval={3000}
    />
  );
}
```

### 受控模式

```tsx
import { useState } from 'react';
import { LobsterProfessor, TeachingAction } from './components/LobsterProfessor';

function App() {
  const [action, setAction] = useState<TeachingAction>('explain');

  return (
    <div>
      <LobsterProfessor
        teachingAction={action}
        onActionChange={setAction}
        autoPlay={false}
      />
      <button onClick={() => setAction('point')}>指向</button>
      <button onClick={() => setAction('emphasize')}>强调</button>
      <button onClick={() => setAction('think')}>思考</button>
    </div>
  );
}
```

### 交互事件

```tsx
<LobsterProfessor
  interactive={true}
  onClick={() => console.log('点击了龙虾教授')}
  onFormulaClick={(formula) => console.log('点击公式:', formula.name)}
/>
```

## 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | number | 600 | 画布宽度 |
| height | number | 500 | 画布高度 |
| autoPlay | boolean | true | 自动播放动画 |
| animationSpeed | number | 1 | 动画速度倍率 |
| formulas | Formula[] | MATH_FORMULAS | 显示的公式列表 |
| formulaInterval | number | 4000 | 公式切换间隔(ms) |
| teachingAction | TeachingAction | - | 受控教学动作 |
| onActionChange | (action) => void | - | 动作变化回调 |
| interactive | boolean | true | 是否可交互 |
| onClick | () => void | - | 点击回调 |
| onFormulaClick | (formula) => void | - | 公式点击回调 |
| className | string | '' | 自定义类名 |
| style | CSSProperties | - | 自定义样式 |

## 教学动作

- **point**: 指向黑板某处
- **explain**: 讲解状态（默认）
- **think**: 思考状态
- **emphasize**: 强调重点

## 子组件

可以单独使用子组件进行自定义：

```tsx
import {
  Blackboard,
  LobsterBody,
  LobsterClaw,
  // ... 其他部件
} from './components/LobsterProfessor';
```

## 动画变体

所有动画变体都导出，可用于自定义：

```tsx
import {
  breatheVariants,
  blinkVariants,
  pointingVariants,
  // ... 其他动画
} from './components/LobsterProfessor';
```

## 常量

```tsx
import {
  LOBSTER_COLORS,    // 龙虾颜色系统
  DIMENSIONS,        // 尺寸配置
  MATH_FORMULAS,     // 默认公式
  ANIMATION_TIMING,  // 动画时序
} from './components/LobsterProfessor';
```
