# Text-to-Speech Converter with AWS Lambda

A beautiful, production-ready React TypeScript application that converts text to speech using AWS Lambda and Amazon Polly. The frontend communicates directly with AWS API Gateway endpoints for seamless speech synthesis.

## Features

- 🎙️ **Natural Voice Synthesis** - Leverage AWS Polly's advanced AI voices
- 🎛️ **Advanced Controls** - Adjust speech rate, pitch, and voice engine
- 🎵 **Built-in Audio Player** - Play, pause, seek, and download generated audio
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- ⚡ **Real-time Processing** - Fast text-to-speech conversion via AWS Lambda
- 🌍 **Multi-language Support** - Support for multiple languages and voices
- 🎨 **Premium UI/UX** - Modern minimalist design with clean aesthetics
- 🔄 **Streaming Audio** - Handles streamed MP3 responses from Lambda functions

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│  AWS API Gateway │───▶│  AWS Lambda     │
│   (Frontend)    │    │   (/synthesize)  │    │   Function      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   AWS Polly     │
                                               │ (TTS Service)   │
                                               └─────────────────┘
```

## Setup

### Prerequisites

1. **AWS Account** - With Lambda and Polly access
2. **AWS API Gateway** - Configured endpoint
3. **Node.js** - Version 16 or higher

### Frontend Configuration

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your AWS API Gateway URL:
   ```env
   VITE_TTS_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### AWS Lambda Backend Setup

Your AWS Lambda function should:

1. **Accept POST requests** to `/synthesize` endpoint
2. **Handle the following request format:**
   ```json
   {
     "text": "Text to convert to speech",
     "voiceId": "Joanna",
     "engine": "neural",
     "outputFormat": "mp3",
     "speechRate": "1.0",
     "pitch": "0"
   }
   ```

3. **Return audio stream** with proper headers:
   ```javascript
   // Lambda response for streaming audio
   return {
     statusCode: 200,
     headers: {
       'Content-Type': 'audio/mpeg',
       'Content-Disposition': 'attachment; filename="speech.mp3"',
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Headers': 'Content-Type',
       'x-request-id': requestId
     },
     body: audioBuffer.toString('base64'),
     isBase64Encoded: true
   };
   ```

### Example Lambda Function

```javascript
const AWS = require('aws-sdk');
const polly = new AWS.Polly();

exports.handler = async (event) => {
  try {
    const { text, voiceId, engine, outputFormat, speechRate, pitch } = JSON.parse(event.body);
    
    // Build SSML if rate or pitch specified
    let processedText = text;
    if (speechRate !== '1.0' || pitch !== '0') {
      processedText = `<prosody rate="${speechRate}" pitch="${pitch > 0 ? '+' : ''}${pitch}st">${text}</prosody>`;
    }
    
    const params = {
      Text: processedText,
      TextType: (speechRate !== '1.0' || pitch !== '0') ? 'ssml' : 'text',
      VoiceId: voiceId,
      OutputFormat: outputFormat || 'mp3',
      Engine: engine || 'standard'
    };
    
    const result = await polly.synthesizeSpeech(params).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'x-request-id': context.awsRequestId
      },
      body: result.AudioStream.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## Usage

1. **Enter Text** - Type or paste the text you want to convert to speech
2. **Select Voice** - Choose from available AWS Polly voices
3. **Adjust Settings** - Fine-tune speech rate, pitch, and engine type
4. **Generate** - Click "Generate Speech" to create the audio
5. **Play & Download** - Use the built-in player to listen and download

## Voice Options

The application supports various AWS Polly voices including:
- **English**: Joanna, Matthew, Amy, Brian, Emma, Olivia
- **French**: Céline, Mathieu, Léa
- **German**: Marlene, Hans, Vicki
- **Spanish**: Penélope, Enrique, Conchita
- **Italian**: Carla, Giorgio, Bianca
- **Portuguese**: Inês, Cristiano
- **Japanese**: Mizuki, Takumi
- **Korean**: Seoyeon
- **Chinese**: Zhiyu

## Technical Features

- **Streaming Audio Support** - Handles both blob URLs and direct audio streams
- **Memory Management** - Automatic cleanup of blob URLs to prevent memory leaks
- **Error Handling** - Comprehensive error handling for network and API issues
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Accessibility** - High contrast colors and keyboard navigation support

## API Integration

The frontend expects your Lambda function to handle:

### Request Format
```typescript
interface LambdaTTSRequest {
  text: string;
  voiceId: string;
  engine?: 'standard' | 'neural';
  outputFormat?: 'mp3' | 'ogg_vorbis' | 'pcm';
  speechRate?: string;
  pitch?: string;
  languageCode?: string;
}
```

### Response Format
- **Success**: Audio stream with `Content-Type: audio/mpeg`
- **Error**: JSON with error message and appropriate HTTP status code

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred hosting service:**
   - Vercel, Netlify, AWS S3, etc.

3. **Configure environment variables** in your hosting platform

4. **Ensure CORS is configured** in your API Gateway for your domain

## Cost Considerations

AWS Polly pricing (as of 2024):
- **Standard voices**: $4.00 per 1 million characters
- **Neural voices**: $16.00 per 1 million characters
- **Free tier**: 5 million characters per month for first 12 months

AWS Lambda pricing:
- **Requests**: $0.20 per 1 million requests
- **Duration**: $0.0000166667 per GB-second

## Security Notes

- API Gateway handles authentication and rate limiting
- No AWS credentials exposed in frontend code
- CORS properly configured for security
- Input validation on both frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details