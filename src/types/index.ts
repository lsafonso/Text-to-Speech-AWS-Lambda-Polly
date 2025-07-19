export interface Voice {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  language: string;
  languageCode: string;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  engine?: 'standard' | 'neural';
  languageCode?: string;
  outputFormat?: 'mp3' | 'ogg_vorbis' | 'pcm';
  sampleRate?: string;
  speechRate?: string;
  pitch?: string;
}

export interface TTSResponse {
  audioUrl: string;
  contentType: string;
  requestId: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}