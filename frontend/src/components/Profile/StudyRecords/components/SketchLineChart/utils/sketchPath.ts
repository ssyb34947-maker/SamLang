// 手绘风格路径生成工具

export const sketchifyPoint = (
  x: number,
  y: number,
  roughness: number = 2
): { x: number; y: number } => ({
  x: x + (Math.random() - 0.5) * roughness,
  y: y + (Math.random() - 0.5) * roughness,
});

export const generateSketchPath = (
  points: { x: number; y: number }[],
  roughness: number = 1.5
): string => {
  if (points.length < 2) return '';
  const sketchPoints = points.map((p) => sketchifyPoint(p.x, p.y, roughness));
  let path = `M ${sketchPoints[0].x} ${sketchPoints[0].y}`;
  
  for (let i = 1; i < sketchPoints.length; i++) {
    const prev = sketchPoints[i - 1];
    const curr = sketchPoints[i];
    const cpX = (prev.x + curr.x) / 2 + (Math.random() - 0.5) * roughness;
    const cpY = (prev.y + curr.y) / 2 + (Math.random() - 0.5) * roughness;
    path += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
  }
  return path;
};

export const generateAreaPath = (
  points: { x: number; y: number }[],
  baselineY: number,
  roughness: number = 1.5
): string => {
  if (points.length < 2) return '';
  const sketchPoints = points.map((p) => sketchifyPoint(p.x, p.y, roughness));
  let path = `M ${sketchPoints[0].x} ${baselineY}`;
  path += ` L ${sketchPoints[0].x} ${sketchPoints[0].y}`;
  
  for (let i = 1; i < sketchPoints.length; i++) {
    const prev = sketchPoints[i - 1];
    const curr = sketchPoints[i];
    const cpX = (prev.x + curr.x) / 2 + (Math.random() - 0.5) * roughness;
    const cpY = (prev.y + curr.y) / 2 + (Math.random() - 0.5) * roughness;
    path += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
  }
  
  path += ` L ${sketchPoints[sketchPoints.length - 1].x} ${baselineY}`;
  path += ' Z';
  return path;
};

export const calculatePoints = (
  data: number[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number }
): { x: number; y: number }[] => {
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const valueRange = maxValue - minValue || 1;
  
  return data.map((value, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
    return { x, y };
  });
};

export const generateSketchGrid = (
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  gridLines: number = 5
): string[] => {
  const paths: string[] = [];
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;
  
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (i / gridLines) * chartHeight;
    const startX = padding.left;
    const endX = padding.left + chartWidth;
    const midY = y + (Math.random() - 0.5) * 1;
    paths.push(`M ${startX} ${y} Q ${(startX + endX) / 2} ${midY} ${endX} ${y}`);
  }
  
  return paths;
};
