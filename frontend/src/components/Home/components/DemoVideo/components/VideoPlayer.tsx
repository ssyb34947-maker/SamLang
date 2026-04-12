import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoControls } from './VideoControls';
import { useVideoPlayer } from '../hooks';
import { videoContainerVariants } from '../animations';
import { sketchStyles } from '../styles';

interface VideoSource {
  src: string;
  type: string;
}

interface VideoPlayerProps {
  poster?: string;
  sources: VideoSource[];
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  poster,
  sources,
  onTimeUpdate,
  onEnded,
  autoPlay = false,
}) => {
  const {
    videoRef,
    containerRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    showControls,
    togglePlay,
    seekTo,
    toggleMute,
    changeVolume,
    toggleFullscreen,
    showControlsTemporarily,
  } = useVideoPlayer({ onTimeUpdate, onEnded, autoPlay });

  // 当视频源变化时重置视频
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      if (autoPlay) {
        video.play().catch(() => { });
      }
    }
  }, [sources, autoPlay]);

  const handleSeekForward = () => {
    seekTo(Math.min(currentTime + 10, duration));
  };

  const handleSeekBackward = () => {
    seekTo(Math.max(currentTime - 10, 0));
  };

  return (
    <motion.div
      ref={containerRef}
      variants={videoContainerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full aspect-video overflow-hidden"
      style={sketchStyles.videoContainer}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && showControlsTemporarily()}
    >
      <AnimatePresence mode="wait">
        <motion.video
          key={sources[0]?.src || 'video'}
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={poster}
          onClick={togglePlay}
          playsInline
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {sources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
          您的浏览器不支持视频播放。
        </motion.video>
      </AnimatePresence>

      {/* Play Button Overlay */}
      {!isPlaying && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--sketch-accent)',
              border: '3px solid white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        </motion.div>
      )}

      <VideoControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        showControls={showControls}
        onTogglePlay={togglePlay}
        onSeek={seekTo}
        onToggleMute={toggleMute}
        onVolumeChange={changeVolume}
        onToggleFullscreen={toggleFullscreen}
        onSeekForward={handleSeekForward}
        onSeekBackward={handleSeekBackward}
      />
    </motion.div>
  );
};
