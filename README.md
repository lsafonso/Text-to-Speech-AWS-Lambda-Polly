# Text-to-Speech Converter with AWS Polly

A beautiful, production-ready React TypeScript application that converts text to speech using AWS Polly through Supabase Edge Functions.

## Features

- 🎙️ **Natural Voice Synthesis** - Leverage AWS Polly's advanced AI voices
- 🎛️ **Advanced Controls** - Adjust speech rate, pitch, and voice engine
- 🎵 **Built-in Audio Player** - Play, pause, seek, and download generated audio
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- ⚡ **Real-time Processing** - Fast text-to-speech conversion
- 🌍 **Multi-language Support** - Support for multiple languages and voices
- 🎨 **Premium UI/UX** - Modern design with smooth animations

## Setup

### Prerequisites

1. **Supabase Account** - [Create a free account](https://supabase.com)
2. **AWS Account** - For AWS Polly access
3. **Node.js** - Version 16 or higher

### Configuration

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create a `.env` file based on `.env.example`

3. **Configure AWS Credentials:**
   - Create an AWS IAM user with Polly permissions
   - Add the following policy to your IAM user:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "polly:SynthesizeSpeech",
           "polly:DescribeVoices"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
   - Set your AWS credentials in Supabase project settings:
     - Go to Project Settings → Edge Functions
     - Add environment variables:
       - `AWS_ACCESS_KEY_ID`
       - `AWS_SECRET_ACCESS_KEY`
       - `AWS_REGION` (e.g., "us-east-1")

4. **Update the Edge Function:**
   - The current edge function includes demo implementation
   - For production, uncomment the AWS Polly API integration code
   - Implement proper AWS signature v4 authentication

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Enter Text** - Type or paste the text you want to convert to speech
2. **Select Voice** - Choose from available AWS Polly voices
3. **Adjust Settings** - Fine-tune speech rate, pitch, and engine type
4. **Generate** - Click "Generate Speech" to create the audio
5. **Play & Download** - Use the built-in player to listen and download

## Voice Options

The application supports various AWS Polly voices including:
- **English**: Joanna, Matthew, Amy, Brian, Emma, Olivia
- **French**: Céline, Mathieu
- **German**: Marlene, Hans
- And many more...

## Technical Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Speech Service**: AWS Polly
- **Icons**: Lucide React
- **Build Tool**: Vite

## Production Deployment

1. **Deploy to Supabase:**
   - Edge functions are automatically deployed
   - Ensure AWS credentials are properly configured

2. **Deploy Frontend:**
   - Build the application: `npm run build`
   - Deploy to your preferred hosting service (Vercel, Netlify, etc.)

## Cost Considerations

AWS Polly pricing (as of 2024):
- Standard voices: $4.00 per 1 million characters
- Neural voices: $16.00 per 1 million characters
- First 5 million characters per month are free for the first 12 months

## Security Notes

- AWS credentials are stored securely in Supabase environment variables
- All API requests are routed through Supabase Edge Functions
- Client-side code never exposes AWS credentials
- CORS is properly configured for security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details