import React from 'react';
import { ChevronDown, User, Globe } from 'lucide-react';
import type { Voice } from '../types';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  loading?: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onVoiceChange,
  loading = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedVoiceData = voices.find(v => v.id === selectedVoice);

  const groupedVoices = voices.reduce((acc, voice) => {
    if (!acc[voice.language]) {
      acc[voice.language] = [];
    }
    acc[voice.language].push(voice);
    return acc;
  }, {} as Record<string, Voice[]>);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <User className="w-4 h-4" />
        Voice Selection
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !loading && setIsOpen(!isOpen)}
          disabled={loading}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-left shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedVoiceData?.gender === 'Female' ? 'bg-pink-400' : 'bg-blue-400'}`} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {selectedVoiceData?.name || 'Select a voice'}
                </div>
                {selectedVoiceData && (
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Globe className="w-3 h-3" />
                    {selectedVoiceData.language}
                  </div>
                )}
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {Object.entries(groupedVoices).map(([language, voiceList]) => (
              <div key={language}>
                <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
                  {language}
                </div>
                {voiceList.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      onVoiceChange(voice.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 ${
                      selectedVoice === voice.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${voice.gender === 'Female' ? 'bg-pink-400' : 'bg-blue-400'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {voice.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {voice.gender}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default VoiceSelector;