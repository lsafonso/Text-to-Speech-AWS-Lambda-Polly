import { corsHeaders } from '../_shared/cors.ts';

// AWS Polly voices configuration
const POLLY_VOICES = [
  { id: 'Joanna', name: 'Joanna', gender: 'Female', language: 'English (US)', languageCode: 'en-US' },
  { id: 'Matthew', name: 'Matthew', gender: 'Male', language: 'English (US)', languageCode: 'en-US' },
  { id: 'Amy', name: 'Amy', gender: 'Female', language: 'English (UK)', languageCode: 'en-GB' },
  { id: 'Brian', name: 'Brian', gender: 'Male', language: 'English (UK)', languageCode: 'en-GB' },
  { id: 'Emma', name: 'Emma', gender: 'Female', language: 'English (UK)', languageCode: 'en-GB' },
  { id: 'Olivia', name: 'Olivia', gender: 'Female', language: 'English (AU)', languageCode: 'en-AU' },
  { id: 'Céline', name: 'Céline', gender: 'Female', language: 'French', languageCode: 'fr-FR' },
  { id: 'Mathieu', name: 'Mathieu', gender: 'Male', language: 'French', languageCode: 'fr-FR' },
  { id: 'Marlene', name: 'Marlene', gender: 'Female', language: 'German', languageCode: 'de-DE' },
  { id: 'Hans', name: 'Hans', gender: 'Male', language: 'German', languageCode: 'de-DE' },
];

interface TTSRequest {
  text: string;
  voiceId: string;
  engine?: 'standard' | 'neural';
  languageCode?: string;
  outputFormat?: 'mp3' | 'ogg_vorbis' | 'pcm';
  sampleRate?: string;
  speechRate?: string;
  pitch?: string;
}

// AWS credentials should be set as environment variables
const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';

// Simple AWS signature v4 implementation for Polly
async function signAWSRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  service: string,
  region: string
) {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured');
  }

  const encoder = new TextEncoder();
  
  // Create canonical request
  const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const date = timestamp.slice(0, 8);
  
  headers['X-Amz-Date'] = timestamp;
  headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY_ID}/${date}/${region}/${service}/aws4_request, SignedHeaders=host;x-amz-date, Signature=dummy`;
  
  return headers;
}

async function callPollyAPI(request: TTSRequest): Promise<ArrayBuffer> {
  const pollyUrl = `https://polly.${AWS_REGION}.amazonaws.com/v1/speech`;
  
  const pollyRequest = {
    Text: request.text,
    VoiceId: request.voiceId,
    OutputFormat: request.outputFormat || 'mp3',
    Engine: request.engine || 'standard',
    ...(request.speechRate && { 
      Text: `<prosody rate="${request.speechRate}">${request.text}</prosody>`,
      TextType: 'ssml'
    }),
    ...(request.pitch && {
      Text: `<prosody pitch="${request.pitch > 0 ? '+' : ''}${request.pitch}st">${request.text}</prosody>`,
      TextType: 'ssml'
    }),
  };

  const headers = {
    'Content-Type': 'application/x-amz-json-1.0',
    'X-Amz-Target': 'com.amazon.speech.synthesis.polly.AWSPollyService.SynthesizeSpeech',
  };

  try {
    // For demo purposes, we'll simulate the AWS Polly response
    // In production, you would implement proper AWS signature and make the actual API call
    throw new Error('AWS Polly integration requires proper AWS credentials and signature implementation');
  } catch (error) {
    console.error('Polly API Error:', error);
    throw error;
  }
}

// Demo function that returns a mock audio URL for development
function generateDemoAudio(request: TTSRequest): string {
  // In a real implementation, this would return the actual audio from AWS Polly
  // For now, we'll return a placeholder
  const params = new URLSearchParams({
    text: request.text.slice(0, 100), // Truncate for URL
    voice: request.voiceId,
    rate: request.speechRate || '1.0',
    pitch: request.pitch || '0'
  });
  
  // This would typically be a presigned S3 URL or direct Polly audio stream
  return `https://example.com/demo-audio.mp3?${params}`;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    
    // Handle voice list endpoint
    if (url.pathname.endsWith('/voices')) {
      return new Response(
        JSON.stringify(POLLY_VOICES),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Handle TTS conversion
    if (req.method === 'POST') {
      const requestData: TTSRequest = await req.json();

      // Validate request
      if (!requestData.text || !requestData.voiceId) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: text and voiceId' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      if (requestData.text.length > 3000) {
        return new Response(
          JSON.stringify({ error: 'Text exceeds maximum length of 3000 characters' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Validate voice ID
      const validVoice = POLLY_VOICES.find(v => v.id === requestData.voiceId);
      if (!validVoice) {
        return new Response(
          JSON.stringify({ error: 'Invalid voice ID' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      try {
        // In production, call AWS Polly API
        // const audioBuffer = await callPollyAPI(requestData);
        
        // For demo purposes, return a mock response
        const audioUrl = generateDemoAudio(requestData);
        
        const response = {
          audioUrl,
          contentType: 'audio/mpeg',
          requestId: crypto.randomUUID(),
        };

        return new Response(
          JSON.stringify(response),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        console.error('TTS Processing Error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to generate speech. Please check your AWS configuration and try again.',
            details: error instanceof Error ? error.message : 'Unknown error'
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});</parameter>