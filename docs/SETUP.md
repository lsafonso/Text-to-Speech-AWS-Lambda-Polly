# Setup Guide

## Prerequisites

Before setting up the Text-to-Speech converter, ensure you have the following:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Supabase account** (free tier available)
- **AWS account** with access to Polly service
- **Git** for version control

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd text-to-speech-converter

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new account
2. Create a new project
3. Wait for the project to be fully initialized
4. Navigate to **Settings** → **API** to find your project URL and anon key

### 2. Configure Edge Functions

The edge functions are already included in the `supabase/functions` directory. They will be automatically deployed when you connect to Supabase.

### 3. Set Environment Variables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add the following environment variables:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: AWS region (e.g., "us-east-1")

## AWS Configuration

### 1. Create AWS Account

If you don't have an AWS account:
1. Go to [AWS Console](https://aws.amazon.com)
2. Create a new account
3. Complete the verification process

### 2. Create IAM User for Polly

1. Navigate to **IAM** → **Users**
2. Click **Create User**
3. Enter username (e.g., "polly-tts-user")
4. Select **Programmatic access**
5. Click **Next: Permissions**

### 3. Attach Polly Permissions

Create a custom policy with the following JSON:

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

Attach this policy to your IAM user.

### 4. Generate Access Keys

1. Select your created user
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Choose **Application running outside AWS**
5. Save the Access Key ID and Secret Access Key securely

## Development Setup

### 1. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 2. Test the Application

1. Enter some text in the input field
2. Select a voice from the dropdown
3. Adjust speech settings if needed
4. Click "Generate Speech"
5. Use the audio player to listen to the generated speech

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Deploy Frontend

You can deploy the built application to any static hosting service:

- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Upload to S3 bucket with static website hosting

### 3. Configure Production Environment

Ensure your production environment has the correct environment variables set.

## Troubleshooting

### Common Issues

1. **"Failed to load voices"**
   - Check your Supabase connection
   - Verify environment variables are set correctly

2. **"AWS credentials not configured"**
   - Ensure AWS credentials are set in Supabase Edge Functions
   - Verify IAM user has correct permissions

3. **"Audio generation failed"**
   - Check AWS Polly service limits
   - Verify text length is under 3,000 characters
   - Check AWS region configuration

### Getting Help

- Check the browser console for detailed error messages
- Verify all environment variables are correctly set
- Ensure AWS credentials have the necessary permissions
- Test with shorter text inputs first

## Security Notes

- Never commit AWS credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate AWS access keys
- Monitor AWS usage to avoid unexpected charges

## Cost Considerations

AWS Polly pricing (as of 2024):
- **Standard voices**: $4.00 per 1 million characters
- **Neural voices**: $16.00 per 1 million characters
- **Free tier**: 5 million characters per month for first 12 months

Monitor your usage through the AWS Console to avoid unexpected charges.