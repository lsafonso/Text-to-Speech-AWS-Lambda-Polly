// AWS Lambda API configuration
const getApiUrl = () => {
  const url = import.meta.env.VITE_TTS_API_URL;
  if (!url) {
    throw new TTSApiError('TTS API URL not configured. Please set VITE_TTS_API_URL environment variable.');
  }
  return url;
};

export class TTSApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'TTSApiError';
  }
}

export interface LambdaTTSRequest {
  text: string;
  voiceId: string;
  engine?: 'standard' | 'neural';
  outputFormat?: 'mp3' | 'ogg_vorbis' | 'pcm';
  speechRate?: string;
  pitch?: string;
  languageCode?: string;
}

export interface LambdaTTSResponse {
  audioUrl: string;
  contentType: string;
  requestId: string;
  audioData?: ArrayBuffer;
}

export async function convertTextToSpeech(request: LambdaTTSRequest): Promise<LambdaTTSResponse> {
  const apiUrl = getApiUrl();

  try {
    const response = await fetch(`${apiUrl}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg, application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new TTSApiError(errorMessage, response.status);
    }

    const contentType = response.headers.get('content-type') || '';
    
    // Handle audio stream response
    if (contentType.includes('audio/')) {
      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: contentType });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return {
        audioUrl,
        contentType,
        requestId: response.headers.get('x-request-id') || crypto.randomUUID(),
        audioData: audioBuffer,
      };
    }
    
    // Handle JSON response with audio URL
    const jsonResponse = await response.json();
    return {
      audioUrl: jsonResponse.audioUrl || jsonResponse.url,
      contentType: jsonResponse.contentType || 'audio/mpeg',
      requestId: jsonResponse.requestId || crypto.randomUUID(),
    };

  } catch (error) {
    if (error instanceof TTSApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new TTSApiError('Network error. Please check your internet connection and VITE_TTS_API_URL configuration.');
    }
    
    throw new TTSApiError('Failed to convert text to speech. Please try again.');
  }
}

export async function getAvailableVoices(): Promise<import('../types').Voice[]> {
  // AWS Polly voices - comprehensive list
  return [
    // English (US)
    { id: 'Joanna', name: 'Joanna', gender: 'Female', language: 'English (US)', languageCode: 'en-US' },
    { id: 'Matthew', name: 'Matthew', gender: 'Male', language: 'English (US)', languageCode: 'en-US' },
    { id: 'Ivy', name: 'Ivy', gender: 'Female', language: 'English (US)', languageCode: 'en-US' },
    { id: 'Justin', name: 'Justin', gender: 'Male', language: 'English (US)', languageCode: 'en-US' },
    { id: 'Kendra', name: 'Kendra', gender: 'Female', language: 'English (US)', languageCode: 'en-US' },
    { id: 'Kimberly', name: 'Kimberly', gender: 'Female', language: 'English (US)', languageCode: 'en-US' },
    { id: 'Salli', name: 'Salli', gender: 'Female', language: 'English (US)', languageCode: 'en-US' },
    { id: 'Joey', name: 'Joey', gender: 'Male', language: 'English (US)', languageCode: 'en-US' },
    
    // English (UK)
    { id: 'Amy', name: 'Amy', gender: 'Female', language: 'English (UK)', languageCode: 'en-GB' },
    { id: 'Brian', name: 'Brian', gender: 'Male', language: 'English (UK)', languageCode: 'en-GB' },
    { id: 'Emma', name: 'Emma', gender: 'Female', language: 'English (UK)', languageCode: 'en-GB' },
    
    // English (Australia)
    { id: 'Nicole', name: 'Nicole', gender: 'Female', language: 'English (AU)', languageCode: 'en-AU' },
    { id: 'Russell', name: 'Russell', gender: 'Male', language: 'English (AU)', languageCode: 'en-AU' },
    { id: 'Olivia', name: 'Olivia', gender: 'Female', language: 'English (AU)', languageCode: 'en-AU' },
    
    // French
    { id: 'Céline', name: 'Céline', gender: 'Female', language: 'French', languageCode: 'fr-FR' },
    { id: 'Mathieu', name: 'Mathieu', gender: 'Male', language: 'French', languageCode: 'fr-FR' },
    { id: 'Léa', name: 'Léa', gender: 'Female', language: 'French', languageCode: 'fr-FR' },
    
    // German
    { id: 'Marlene', name: 'Marlene', gender: 'Female', language: 'German', languageCode: 'de-DE' },
    { id: 'Hans', name: 'Hans', gender: 'Male', language: 'German', languageCode: 'de-DE' },
    { id: 'Vicki', name: 'Vicki', gender: 'Female', language: 'German', languageCode: 'de-DE' },
    
    // Spanish
    { id: 'Penélope', name: 'Penélope', gender: 'Female', language: 'Spanish (ES)', languageCode: 'es-ES' },
    { id: 'Enrique', name: 'Enrique', gender: 'Male', language: 'Spanish (ES)', languageCode: 'es-ES' },
    { id: 'Conchita', name: 'Conchita', gender: 'Female', language: 'Spanish (ES)', languageCode: 'es-ES' },
    
    // Italian
    { id: 'Carla', name: 'Carla', gender: 'Female', language: 'Italian', languageCode: 'it-IT' },
    { id: 'Giorgio', name: 'Giorgio', gender: 'Male', language: 'Italian', languageCode: 'it-IT' },
    { id: 'Bianca', name: 'Bianca', gender: 'Female', language: 'Italian', languageCode: 'it-IT' },
    
    // Portuguese
    { id: 'Inês', name: 'Inês', gender: 'Female', language: 'Portuguese', languageCode: 'pt-PT' },
    { id: 'Cristiano', name: 'Cristiano', gender: 'Male', language: 'Portuguese', languageCode: 'pt-PT' },
    
    // Japanese
    { id: 'Mizuki', name: 'Mizuki', gender: 'Female', language: 'Japanese', languageCode: 'ja-JP' },
    { id: 'Takumi', name: 'Takumi', gender: 'Male', language: 'Japanese', languageCode: 'ja-JP' },
    
    // Korean
    { id: 'Seoyeon', name: 'Seoyeon', gender: 'Female', language: 'Korean', languageCode: 'ko-KR' },
    
    // Chinese
    { id: 'Zhiyu', name: 'Zhiyu', gender: 'Female', language: 'Chinese (Mandarin)', languageCode: 'cmn-CN' },
  ];
}

// Utility function to clean up blob URLs to prevent memory leaks
export function cleanupAudioUrl(url: string) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}