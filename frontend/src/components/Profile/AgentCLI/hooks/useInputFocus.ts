import { useEffect, useRef } from 'react';

interface UseInputFocusOptions {
  isBooting: boolean;
  isProcessing: boolean;
  mode: string;
}

export const useInputFocus = ({ isBooting, isProcessing, mode }: UseInputFocusOptions) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isBooting && !isProcessing) {
      inputRef.current?.focus();
    }
  }, [isBooting, isProcessing, mode]);

  return inputRef;
};

export default useInputFocus;
