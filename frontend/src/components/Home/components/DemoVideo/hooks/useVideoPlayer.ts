import { useState, useRef, useCallback, useEffect } from 'react';
import { VIDEO_PLAYER_CONFIG, KEYBOARD_SHORTCUTS } from '../constants';

interface UseVideoPlayerOptions {
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export const useVideoPlayer = (options: UseVideoPlayerOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    showControls: true,
    playbackRate: VIDEO_PLAYER_CONFIG.DEFAULT_PLAYBACK_RATE,
  });
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    state.isPlaying ? video.pause() : video.play();
  }, [state.isPlaying]);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, state.duration));
  }, [state.duration]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) video.muted = !state.isMuted;
  }, [state.isMuted]);

  const changeVolume = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(1, newVolume));
    video.volume = clamped;
    updateState({ volume: clamped, isMuted: clamped === 0 });
  }, [updateState]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    state.isFullscreen
      ? document.exitFullscreen?.()
      : containerRef.current.requestFullscreen?.();
  }, [state.isFullscreen]);

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      updateState({ playbackRate: rate });
    }
  }, [updateState]);

  const showControlsTemporarily = useCallback(() => {
    updateState({ showControls: true });
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (state.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        updateState({ showControls: false });
      }, VIDEO_PLAYER_CONFIG.CONTROLS_TIMEOUT);
    }
  }, [state.isPlaying, updateState]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlers = {
      play: () => updateState({ isPlaying: true }),
      pause: () => updateState({ isPlaying: false }),
      timeupdate: () => {
        updateState({ currentTime: video.currentTime });
        options.onTimeUpdate?.(video.currentTime);
      },
      loadedmetadata: () => updateState({ duration: video.duration }),
      volumechange: () => updateState({ volume: video.volume, isMuted: video.muted }),
      ended: () => {
        updateState({ isPlaying: false });
        options.onEnded?.();
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [options, updateState]);

  useEffect(() => {
    const handler = () => updateState({ isFullscreen: !!document.fullscreenElement });
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [updateState]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const actions: Record<string, () => void> = {
        [KEYBOARD_SHORTCUTS.PLAY_PAUSE]: togglePlay,
        [KEYBOARD_SHORTCUTS.MUTE]: toggleMute,
        [KEYBOARD_SHORTCUTS.FULLSCREEN]: toggleFullscreen,
        [KEYBOARD_SHORTCUTS.SEEK_FORWARD]: () => seekTo(state.currentTime + VIDEO_PLAYER_CONFIG.SEEK_STEP),
        [KEYBOARD_SHORTCUTS.SEEK_BACKWARD]: () => seekTo(state.currentTime - VIDEO_PLAYER_CONFIG.SEEK_STEP),
        [KEYBOARD_SHORTCUTS.VOLUME_UP]: () => changeVolume(state.volume + VIDEO_PLAYER_CONFIG.VOLUME_STEP),
        [KEYBOARD_SHORTCUTS.VOLUME_DOWN]: () => changeVolume(state.volume - VIDEO_PLAYER_CONFIG.VOLUME_STEP),
      };
      
      if (actions[e.key]) {
        e.preventDefault();
        actions[e.key]();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, toggleMute, toggleFullscreen, seekTo, changeVolume, state.currentTime, state.volume]);

  return {
    videoRef,
    containerRef,
    ...state,
    togglePlay,
    seekTo,
    toggleMute,
    changeVolume,
    toggleFullscreen,
    changePlaybackRate,
    showControlsTemporarily,
  };
};
