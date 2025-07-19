import React, { useState, useEffect } from 'react';
import { Volume2, Wand2, AlertTriangle, CheckCircle } from 'lucide-react';
import TextInput from './components/TextInput';
import VoiceSelector from './components/VoiceSelector';
import SpeechControls from './components/SpeechControls';
import AudioPlayer from './components/AudioPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import { convertTextToSpeech, getAvailableVoices, TTSApiError } from './utils/api';
import type { Voice, TTSRequest, AudioPlayerState } from './types';

// Demo voices for development
const DEMO_VOICES: Voice[] = [
  { id: 'Joanna', name: 'Joanna', gender: 'Female', language: 'English (US)', languageCode: 'en-US' },
  { id: 'Matthew', name: 'Matthew', gender: 'Male', language: 'English (US)', languageCode: 'en-US' },
  { id: 'Amy', name: 'Amy', gender: 'Female', language: 'English (UK)', languageCode: 'en-GB' },
  { id: 'Brian', name: 'Brian', gender: 'Male', language: 'English (UK)', languageCode: 'en-GB' },
  { id: 'Céline', name: 'Céline', gender: 'Female', language: 'French', languageCode: 'fr-FR' },
  { id: 'Mathieu', name: 'Mathieu', gender: 'Male', language: 'French', languageCode: 'fr-FR' },
];

function App() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Joanna');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [engine, setEngine] = useState<'standard' | 'neural'>('standard');
  const [voices, setVoices] = useState<Voice[]>(DEMO_VOICES);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingVoices, setLoadingVoices] = useState(false);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setLoadingVoices(true);
    try {
      const availableVoices = await getAvailableVoices();
      setVoices(availableVoices);
    } catch (err) {
      console.warn('Failed to load voices from API, using demo voices:', err);
      // Continue with demo voices
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to speech.');
      return;
    }

    if (text.length > 3000) {
      setError('Text exceeds maximum length of 3,000 characters.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    const request: TTSRequest = {
      text: text.trim(),
      voiceId: selectedVoice,
      engine,
      outputFormat: 'mp3',
      speechRate: speechRate.toString(),
      pitch: pitch.toString(),
    };

    try {
      const response = await convertTextToSpeech(request);
      setAudioUrl(response.audioUrl);
      setSuccess('Audio generated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      if (err instanceof TTSApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('TTS Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAudioStateChange = (state: AudioPlayerState) => {
    // Handle audio state changes if needed
    console.log('Audio state:', state);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-slate-900 rounded-lg">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900">
                Text to Speech
              </h1>
            </div>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Transform your text into natural-sounding speech using AWS Polly's advanced AI voices.
              Perfect for content creation, accessibility, and more.
            </p>
          </div>

          {/* Alert Messages */}
          {(error || success) && (
            <div className="mb-8">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-900 font-medium">Error</p>
                    <p className="text-red-700 text-sm mt-1 leading-relaxed">{error}</p>
                  </div>
                  <button
                    onClick={clearMessages}
                    className="text-red-400 hover:text-red-600 transition-colors text-lg"
                  >
                    ×
                  </button>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-900 font-medium">Success</p>
                    <p className="text-green-700 text-sm mt-1 leading-relaxed">{success}</p>
                  </div>
                  <button
                    onClick={clearMessages}
                    className="text-green-400 hover:text-green-600 transition-colors text-lg"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Input and Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Text Input */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <TextInput
                  value={text}
                  onChange={setText}
                  error={error && text.length > 3000 ? error : undefined}
                />
              </div>

              {/* Voice Selection */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <VoiceSelector
                  voices={voices}
                  selectedVoice={selectedVoice}
                  onVoiceChange={setSelectedVoice}
                  loading={loadingVoices}
                />
              </div>

              {/* Speech Controls */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <SpeechControls
                  speechRate={speechRate}
                  onSpeechRateChange={setSpeechRate}
                  pitch={pitch}
                  onPitchChange={setPitch}
                  engine={engine}
                  onEngineChange={setEngine}
                />
              </div>
            </div>

            {/* Right Column - Generation and Playback */}
            <div className="space-y-6">
              {/* Generate Button */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !text.trim() || text.length > 3000}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Speech
                    </>
                  )}
                </button>

                <div className="mt-6 text-center text-sm text-slate-500 space-y-1">
                  <p>Characters: {text.length.toLocaleString()}/3,000</p>
                  {text.trim() && (
                    <p>
                      Estimated cost: ~$0.{Math.ceil(text.length / 100).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              </div>

              {/* Audio Player */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-slate-900 mb-6">Audio Player</h3>
                <AudioPlayer
                  audioUrl={audioUrl}
                  onStateChange={handleAudioStateChange}
                />
              </div>

              {/* Usage Information */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-900 mb-4">💡 Pro Tips</h3>
                <ul className="text-sm text-slate-600 space-y-2 leading-relaxed">
                  <li>• Use Neural engine for more natural speech</li>
                  <li>• Adjust speech rate for better comprehension</li>
                  <li>• Try different voices for varied content</li>
                  <li>• Use SSML tags for advanced control</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-slate-500 text-sm">
            <p>Powered by AWS Polly • Maximum 3,000 characters per request</p>
          </div>
        </div>
    </div>
  );
}

export default App;