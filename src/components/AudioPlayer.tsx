import React, { useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, RotateCcw } from 'lucide-react';
import { cleanupAudioUrl } from '../utils/api';
import type { AudioPlayerState } from '../types';

interface AudioPlayerProps {
  audioUrl: string | null;
  onStateChange?: (state: AudioPlayerState) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onStateChange }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = React.useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset audio state when URL changes
    setState(prev => ({ ...prev, currentTime: 0, isPlaying: false }));

    const updateTime = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const updateDuration = () => {
      setState(prev => ({ ...prev, duration: audio.duration || 0 }));
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        cleanupAudioUrl(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (state.isPlaying) {
        audio.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        await audio.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setState(prev => ({ ...prev, volume: newVolume }));
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setState(prev => ({ ...prev, currentTime: 0 }));
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    try {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `tts-audio-${Date.now()}.mp3`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatTime = (time: number): string => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <div className="bg-slate-50 rounded-lg p-6 text-center">
        <div className="text-slate-400 mb-2">
          <Volume2 className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-slate-500 text-sm">Generate audio to see player controls</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={state.duration || 0}
            value={state.currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #0f172a 0%, #0f172a ${(state.currentTime / state.duration) * 100}%, #e5e7eb ${(state.currentTime / state.duration) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              {state.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={restart}
              className="flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={state.volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Download Button */}
            <button
              onClick={downloadAudio}
              className="flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all duration-200"
              title="Download Audio"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
    </div>
  );
};

export default AudioPlayer;