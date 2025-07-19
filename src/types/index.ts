export interface Voice {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  language: string;
  languageCode: string;
}

export interface LambdaTTSRequest {
  text: string;
  voiceId: string;
  engine?: 'standard' | 'neural';
  languageCode?: string;
  outputFormat?: 'mp3' | 'ogg_vorbis' | 'pcm';
  sampleRate?: string;
  speechRate?: string;
  pitch?: string;
}

export interface LambdaTTSResponse {
  audioUrl: string;
  contentType: string;
  requestId: string;
  audioData?: ArrayBuffer;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}