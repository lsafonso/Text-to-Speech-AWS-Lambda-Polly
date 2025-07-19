const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export class TTSApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'TTSApiError';
  }
}

export async function convertTextToSpeech(request: import('../types').TTSRequest): Promise<import('../types').TTSResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new TTSApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TTSApiError) {
      throw error;
    }
    throw new TTSApiError('Failed to convert text to speech. Please try again.');
  }
}

export async function getAvailableVoices(): Promise<import('../types').Voice[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/text-to-speech/voices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      throw new TTSApiError(`Failed to fetch voices: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TTSApiError) {
      throw error;
    }
    throw new TTSApiError('Failed to load available voices.');
  }
}