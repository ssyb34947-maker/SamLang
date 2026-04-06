import { useEffect, useState, useRef } from 'react';
import { loadCLICache } from '../cache';

interface UseAutoStartOptions {
  onAutoStart: () => void;
}

export const useAutoStart = ({ onAutoStart }: UseAutoStartOptions) => {
  const [hasCheckedCache, setHasCheckedCache] = useState(false);
  const [isAutoStarting, setIsAutoStarting] = useState(false);
  const autoStartRef = useRef(false);

  useEffect(() => {
    if (hasCheckedCache || autoStartRef.current) return;
    
    autoStartRef.current = true;
    const cached = loadCLICache();
    
    if (!cached || cached.length === 0) {
      // 没有缓存，显示输入过程然后自动启动
      setIsAutoStarting(true);
      setTimeout(() => {
        onAutoStart();
        setIsAutoStarting(false);
      }, 1200);
    }
    
    setHasCheckedCache(true);
  }, [hasCheckedCache, onAutoStart]);

  return { hasCheckedCache, isAutoStarting };
};

export default useAutoStart;
