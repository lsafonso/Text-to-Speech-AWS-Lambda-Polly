# API Documentation

## Overview

The Text-to-Speech API is implemented using Supabase Edge Functions and provides endpoints for voice synthesis and voice listing. All endpoints use JSON for request/response data and include proper CORS headers.

## Base URL

```
https://your-project.supabase.co/functions/v1
```

## Authentication

All API requests require authentication using the Supabase anon key:

```http
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

## Endpoints

### 1. Generate Speech

Convert text to speech using AWS Polly.

**Endpoint:** `POST /text-to-speech`

#### Request

```http
POST /text-to-speech
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY

{
  "text": "Hello, this is a test of the text-to-speech system.",
  "voiceId": "Joanna",
  "engine": "neural",
  "outputFormat": "mp3",
  "speechRate": "1.0",
  "pitch": "0"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to convert to speech (max 3,000 characters) |
| `voiceId` | string | Yes | AWS Polly voice ID (e.g., "Joanna", "Matthew") |
| `engine` | string | No | Voice engine: "standard" or "neural" (default: "standard") |
| `outputFormat` | string | No | Audio format: "mp3", "ogg_vorbis", or "pcm" (default: "mp3") |
| `speechRate` | string | No | Speech rate: "0.25" to "4.0" (default: "1.0") |
| `pitch` | string | No | Pitch adjustment: "-20" to "20" semitones (default: "0") |

#### Response

**Success (200 OK):**

```json
{
  "audioUrl": "https://example.com/audio/generated-speech.mp3",
  "contentType": "audio/mpeg",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error (400 Bad Request):**

```json
{
  "error": "Missing required fields: text and voiceId"
}
```

**Error (500 Internal Server Error):**

```json
{
  "error": "Failed to generate speech. Please check your AWS configuration and try again.",
  "details": "AWS credentials not configured"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `audioUrl` | string | URL to the generated audio file |
| `contentType` | string | MIME type of the audio file |
| `requestId` | string | Unique identifier for the request |

### 2. List Available Voices

Retrieve all available AWS Polly voices.

**Endpoint:** `GET /text-to-speech/voices`

#### Request

```http
GET /text-to-speech/voices
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

#### Response

**Success (200 OK):**

```json
[
  {
    "id": "Joanna",
    "name": "Joanna",
    "gender": "Female",
    "language": "English (US)",
    "languageCode": "en-US"
  },
  {
    "id": "Matthew",
    "name": "Matthew",
    "gender": "Male",
    "language": "English (US)",
    "languageCode": "en-US"
  },
  {
    "id": "Amy",
    "name": "Amy",
    "gender": "Female",
    "language": "English (UK)",
    "languageCode": "en-GB"
  }
]
```

#### Voice Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique voice identifier for AWS Polly |
| `name` | string | Human-readable voice name |
| `gender` | string | Voice gender: "Male" or "Female" |
| `language` | string | Human-readable language name |
| `languageCode` | string | ISO language code (e.g., "en-US") |

## Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details about the error",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `MISSING_FIELDS` | Required fields are missing |
| 400 | `TEXT_TOO_LONG` | Text exceeds 3,000 character limit |
| 400 | `INVALID_VOICE` | Voice ID is not valid |
| 400 | `INVALID_PARAMETERS` | Request parameters are invalid |
| 401 | `UNAUTHORIZED` | Missing or invalid authorization |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `AWS_ERROR` | AWS Polly service error |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit:** 10 requests per minute per client
- **Headers:** Rate limit information is included in response headers
- **Exceeded:** Returns 429 status with retry information

## CORS Support

The API supports Cross-Origin Resource Sharing (CORS) with the following configuration:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Generate speech
const generateSpeech = async (text: string, voiceId: string) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/text-to-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      text,
      voiceId,
      engine: 'neural',
      outputFormat: 'mp3'
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// Get voices
const getVoices = async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/text-to-speech/voices`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  return await response.json();
};
```

### cURL

```bash
# Generate speech
curl -X POST "https://your-project.supabase.co/functions/v1/text-to-speech" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "text": "Hello world",
    "voiceId": "Joanna",
    "engine": "neural"
  }'

# Get voices
curl -X GET "https://your-project.supabase.co/functions/v1/text-to-speech/voices" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

### Python

```python
import requests
import json

# Configuration
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your_anon_key"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
}

# Generate speech
def generate_speech(text, voice_id):
    url = f"{SUPABASE_URL}/functions/v1/text-to-speech"
    data = {
        "text": text,
        "voiceId": voice_id,
        "engine": "neural"
    }
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

# Get voices
def get_voices():
    url = f"{SUPABASE_URL}/functions/v1/text-to-speech/voices"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()
```

## Best Practices

### 1. Error Handling

Always implement proper error handling:

```typescript
try {
  const result = await generateSpeech(text, voiceId);
  // Handle success
} catch (error) {
  if (error.status === 400) {
    // Handle client error
  } else if (error.status === 500) {
    // Handle server error
  }
}
```

### 2. Input Validation

Validate input before sending requests:

```typescript
const validateInput = (text: string, voiceId: string) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text is required');
  }
  
  if (text.length > 3000) {
    throw new Error('Text exceeds maximum length');
  }
  
  if (!voiceId) {
    throw new Error('Voice ID is required');
  }
};
```

### 3. Caching

Cache voice lists to reduce API calls:

```typescript
let cachedVoices: Voice[] | null = null;

const getVoicesWithCache = async () => {
  if (cachedVoices) {
    return cachedVoices;
  }
  
  cachedVoices = await getVoices();
  return cachedVoices;
};
```

### 4. Rate Limiting

Implement client-side rate limiting:

```typescript
class RateLimiter {
  private requests: number[] = [];
  private limit = 10;
  private window = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);
    return this.requests.length < this.limit;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }
}
```

## Testing

### Unit Tests

```typescript
describe('TTS API', () => {
  it('should generate speech successfully', async () => {
    const result = await generateSpeech('Hello world', 'Joanna');
    expect(result.audioUrl).toBeDefined();
    expect(result.contentType).toBe('audio/mpeg');
  });

  it('should handle invalid input', async () => {
    await expect(generateSpeech('', 'Joanna')).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
describe('TTS Integration', () => {
  it('should complete full workflow', async () => {
    // 1. Get voices
    const voices = await getVoices();
    expect(voices.length).toBeGreaterThan(0);

    // 2. Generate speech
    const result = await generateSpeech('Test', voices[0].id);
    expect(result.audioUrl).toBeDefined();

    // 3. Verify audio is accessible
    const audioResponse = await fetch(result.audioUrl);
    expect(audioResponse.ok).toBe(true);
  });
});
```