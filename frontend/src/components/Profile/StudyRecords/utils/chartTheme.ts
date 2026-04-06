// 图表主题配置 - 手绘风格

export const sketchChartTheme = {
  colors: {
    primary: '#ff4d4d',      // 红色强调
    secondary: '#2d5da1',    // 蓝色次要
    accent: '#fff9c4',       // 便利贴黄
    text: '#2d2d2d',         // 文字色
    muted: '#e5e0d8',        // 辅助色
    background: '#fdfbf7',   // 背景色
    white: '#ffffff',
  },
  fonts: {
    heading: "'Kalam', cursive",
    body: "'Patrick Hand', cursive",
  },
  stroke: {
    width: 2,
    dasharray: '5,5',        // 虚线效果
  },
};

// 图表容器样式
export const chartContainerClass = 'bg-white border-[3px] border-[#2d2d2d] rounded-[var(--wobbly)] shadow-[var(--shadow-hard)] p-4';

// 图表标题样式
export const chartTitleClass = 'font-[var(--font-hand-heading)] text-lg font-bold text-[#2d2d2d] mb-4';
