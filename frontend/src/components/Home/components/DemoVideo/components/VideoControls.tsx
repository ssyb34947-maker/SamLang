import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { controlsVariants, buttonHoverVariants, buttonTapVariants } from '../animations';
import { sketchStyles, typography } from '../styles';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleFullscreen: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  showControls,
  onTogglePlay,
  onSeek,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
  onSeekForward,
  onSeekBackward,
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    onSeek(clickPosition * duration);
  };

  return (
    <motion.div
      variants={controlsVariants}
      initial="hidden"
      animate={showControls ? 'visible' : 'hidden'}
      className="absolute bottom-0 left-0 right-0 p-4"
      style={sketchStyles.controls}
    >
      {/* Progress Bar */}
      <div
        className="w-full mb-4 cursor-pointer"
        style={sketchStyles.progressBar}
        onClick={handleProgressClick}
      >
        <div
          className="relative h-full"
          style={{ width: `${progress}%`, ...sketchStyles.progressFill }}
        >
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md"
            style={{ transform: 'translate(50%, -50%)' }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={buttonHoverVariants}
            whileTap={buttonTapVariants}
            onClick={onSeekBackward}
            style={sketchStyles.button}
          >
            <SkipBack className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={buttonHoverVariants}
            whileTap={buttonTapVariants}
            onClick={onTogglePlay}
            style={sketchStyles.button}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </motion.button>

          <motion.button
            whileHover={buttonHoverVariants}
            whileTap={buttonTapVariants}
            onClick={onSeekForward}
            style={sketchStyles.button}
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 ml-2">
            <motion.button
              whileHover={buttonHoverVariants}
              whileTap={buttonTapVariants}
              onClick={onToggleMute}
              style={sketchStyles.button}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </motion.button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: 'var(--sketch-accent)' }}
            />
          </div>
        </div>

        {/* Time Display */}
        <div style={typography.timeDisplay}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Fullscreen */}
        <motion.button
          whileHover={buttonHoverVariants}
          whileTap={buttonTapVariants}
          onClick={onToggleFullscreen}
          style={sketchStyles.button}
        >
          <Maximize className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};
