import React from 'react';
import { Settings, Gauge, Music } from 'lucide-react';

interface SpeechControlsProps {
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  engine: 'standard' | 'neural';
  onEngineChange: (engine: 'standard' | 'neural') => void;
}

const SpeechControls: React.FC<SpeechControlsProps> = ({
  speechRate,
  onSpeechRateChange,
  pitch,
  onPitchChange,
  engine,
  onEngineChange
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-700">Speech Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speech Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Gauge className="w-4 h-4" />
              Speech Rate
            </label>
            <span className="text-sm text-gray-500">{speechRate}x</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min={0.25}
              max={4.0}
              step={0.25}
              value={speechRate}
              onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((speechRate - 0.25) / (4.0 - 0.25)) * 100}%, #e5e7eb ${((speechRate - 0.25) / (4.0 - 0.25)) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Slower</span>
              <span>Normal</span>
              <span>Faster</span>
            </div>
          </div>
        </div>

        {/* Pitch */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Music className="w-4 h-4" />
              Pitch
            </label>
            <span className="text-sm text-gray-500">{pitch > 0 ? '+' : ''}{pitch}st</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min={-20}
              max={20}
              step={1}
              value={pitch}
              onChange={(e) => onPitchChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((pitch + 20) / 40) * 100}%, #e5e7eb ${((pitch + 20) / 40) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Lower</span>
              <span>Normal</span>
              <span>Higher</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Voice Engine
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => onEngineChange('standard')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              engine === 'standard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => onEngineChange('neural')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              engine === 'neural'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Neural (Premium)
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Neural voices provide more natural and expressive speech quality
        </p>
      </div>
    </div>
  );
};

export default SpeechControls;