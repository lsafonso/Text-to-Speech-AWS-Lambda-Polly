# How the Text-to-Speech App Works

## Architecture Overview

The Text-to-Speech converter is built using a modern, serverless architecture that combines React frontend with AWS Polly through Supabase Edge Functions.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│ Supabase Edge    │───▶│   AWS Polly     │
│   (Frontend)    │    │   Functions      │    │   (TTS Service) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Component Architecture

### Frontend Components

1. **App.tsx** - Main application container
2. **TextInput.tsx** - Text input with character counting
3. **VoiceSelector.tsx** - Voice selection dropdown
4. **SpeechControls.tsx** - Rate, pitch, and engine controls
5. **AudioPlayer.tsx** - Audio playback and download
6. **LoadingSpinner.tsx** - Loading state indicator

### Backend Services

1. **Supabase Edge Functions** - Serverless API endpoints
2. **AWS Polly Integration** - Text-to-speech conversion
3. **CORS Handling** - Cross-origin request management

## Data Flow

### 1. User Input Processing

```typescript
// User enters text
const handleTextChange = (text: string) => {
  setText(text);
  // Real-time character counting
  // Input validation
};
```

### 2. Voice Selection

```typescript
// Voice data structure
interface Voice {
  id: string;           // AWS Polly voice ID
  name: string;         // Display name
  gender: 'Male' | 'Female';
  language: string;     // Human-readable language
  languageCode: string; // ISO language code
}
```

### 3. Speech Generation Request

```typescript
// TTS request payload
interface TTSRequest {
  text: string;         // Text to convert
  voiceId: string;      // Selected voice
  engine?: 'standard' | 'neural';
  outputFormat?: 'mp3' | 'ogg_vorbis';
  speechRate?: string;  // Speed adjustment
  pitch?: string;       // Pitch adjustment
}
```

### 4. API Communication

```typescript
// Frontend API call
const response = await fetch(`${SUPABASE_URL}/functions/v1/text-to-speech`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  },
  body: JSON.stringify(request),
});
```

### 5. Edge Function Processing

```typescript
// Supabase Edge Function
Deno.serve(async (req: Request) => {
  // 1. Parse request
  const requestData: TTSRequest = await req.json();
  
  // 2. Validate input
  if (!requestData.text || requestData.text.length > 3000) {
    return errorResponse;
  }
  
  // 3. Call AWS Polly
  const audioBuffer = await callPollyAPI(requestData);
  
  // 4. Return audio URL
  return successResponse;
});
```

### 6. AWS Polly Integration

```typescript
// AWS Polly API call
const pollyRequest = {
  Text: request.text,
  VoiceId: request.voiceId,
  OutputFormat: 'mp3',
  Engine: request.engine || 'standard'
};

// AWS signature v4 authentication
const signedHeaders = await signAWSRequest(
  'POST',
  pollyUrl,
  headers,
  JSON.stringify(pollyRequest),
  'polly',
  AWS_REGION
);
```

## Key Features Explained

### Real-time Character Counting

```typescript
const charactersUsed = text.length;
const isNearLimit = charactersUsed > maxLength * 0.8;
const isOverLimit = charactersUsed > maxLength;

// Visual feedback based on character count
const borderColor = isOverLimit ? 'border-red-300' : 
                   isNearLimit ? 'border-yellow-300' : 
                   'border-gray-300';
```

### Voice Grouping by Language

```typescript
const groupedVoices = voices.reduce((acc, voice) => {
  if (!acc[voice.language]) {
    acc[voice.language] = [];
  }
  acc[voice.language].push(voice);
  return acc;
}, {} as Record<string, Voice[]>);
```

### Audio Player State Management

```typescript
interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

// Real-time audio updates
const updateTime = () => {
  setState(prev => ({ 
    ...prev, 
    currentTime: audio.currentTime 
  }));
};
```

### Speech Controls Implementation

```typescript
// SSML generation for advanced controls
const generateSSML = (text: string, rate: number, pitch: number) => {
  return `<prosody rate="${rate}" pitch="${pitch > 0 ? '+' : ''}${pitch}st">
    ${text}
  </prosody>`;
};
```

## Error Handling

### Frontend Error Management

```typescript
class TTSApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'TTSApiError';
  }
}

// Graceful error handling
try {
  const response = await convertTextToSpeech(request);
  setAudioUrl(response.audioUrl);
} catch (error) {
  if (error instanceof TTSApiError) {
    setError(error.message);
  } else {
    setError('An unexpected error occurred');
  }
}
```

### Backend Error Responses

```typescript
// Structured error responses
return new Response(
  JSON.stringify({ 
    error: 'Text exceeds maximum length',
    details: 'Maximum 3,000 characters allowed',
    code: 'TEXT_TOO_LONG'
  }),
  {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  }
);
```

## Security Implementation

### CORS Configuration

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};
```

### Environment Variable Protection

```typescript
// Secure credential access
const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials not configured');
}
```

## Performance Optimizations

### Lazy Loading and Code Splitting

```typescript
// Component lazy loading
const AudioPlayer = React.lazy(() => import('./components/AudioPlayer'));

// Suspense wrapper
<Suspense fallback={<LoadingSpinner />}>
  <AudioPlayer audioUrl={audioUrl} />
</Suspense>
```

### Debounced Input Handling

```typescript
// Prevent excessive API calls
const debouncedTextChange = useCallback(
  debounce((text: string) => {
    // Process text change
  }, 300),
  []
);
```

### Audio Preloading

```typescript
// Preload audio for better UX
<audio 
  ref={audioRef} 
  src={audioUrl} 
  preload="metadata"
  onLoadedMetadata={updateDuration}
/>
```

## Scalability Considerations

### Rate Limiting

```typescript
// Implement rate limiting in edge functions
const rateLimiter = new Map();

const checkRateLimit = (clientId: string) => {
  const now = Date.now();
  const requests = rateLimiter.get(clientId) || [];
  
  // Allow 10 requests per minute
  const recentRequests = requests.filter(
    time => now - time < 60000
  );
  
  if (recentRequests.length >= 10) {
    throw new Error('Rate limit exceeded');
  }
  
  rateLimiter.set(clientId, [...recentRequests, now]);
};
```

### Caching Strategy

```typescript
// Cache voice list to reduce API calls
const VOICE_CACHE_KEY = 'polly_voices';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getCachedVoices = () => {
  const cached = localStorage.getItem(VOICE_CACHE_KEY);
  if (cached) {
    const { voices, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return voices;
    }
  }
  return null;
};
```

This architecture provides a robust, scalable, and maintainable solution for text-to-speech conversion with excellent user experience and performance characteristics.