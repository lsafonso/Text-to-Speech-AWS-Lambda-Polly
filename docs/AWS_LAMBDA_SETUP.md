# AWS Lambda Setup Guide

This guide walks you through setting up the AWS Lambda backend for the Text-to-Speech converter.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (optional but recommended)
- Basic understanding of AWS Lambda and API Gateway

## Step 1: Create IAM Role for Lambda

### 1.1 Create Policy for Polly Access

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
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### 1.2 Create IAM Role

1. Go to IAM → Roles → Create Role
2. Select "AWS Service" → "Lambda"
3. Attach the policy created above
4. Name the role: `lambda-polly-tts-role`

## Step 2: Create Lambda Function

### 2.1 Basic Function Setup

1. Go to AWS Lambda Console
2. Click "Create Function"
3. Choose "Author from scratch"
4. Function name: `text-to-speech-converter`
5. Runtime: `Node.js 18.x` or later
6. Execution role: Use the role created above

### 2.2 Function Code

```javascript
const AWS = require('aws-sdk');

// Configure AWS SDK
const polly = new AWS.Polly({
  region: process.env.AWS_REGION || 'us-east-1'
});

exports.handler = async (event, context) => {
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const {
      text,
      voiceId,
      engine = 'standard',
      outputFormat = 'mp3',
      speechRate = '1.0',
      pitch = '0',
      languageCode
    } = requestBody;

    // Validate required fields
    if (!text || !voiceId) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields: text and voiceId'
        })
      };
    }

    // Validate text length
    if (text.length > 3000) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Text exceeds maximum length of 3000 characters'
        })
      };
    }

    // Build text with SSML if needed
    let processedText = text;
    let textType = 'text';

    if (speechRate !== '1.0' || pitch !== '0') {
      processedText = `<prosody rate="${speechRate}" pitch="${pitch > 0 ? '+' : ''}${pitch}st">${text}</prosody>`;
      textType = 'ssml';
    }

    // Prepare Polly parameters
    const pollyParams = {
      Text: processedText,
      TextType: textType,
      VoiceId: voiceId,
      OutputFormat: outputFormat,
      Engine: engine
    };

    // Add language code if specified
    if (languageCode) {
      pollyParams.LanguageCode = languageCode;
    }

    console.log('Polly request:', JSON.stringify(pollyParams, null, 2));

    // Call Polly to synthesize speech
    const pollyResponse = await polly.synthesizeSpeech(pollyParams).promise();

    // Return audio stream
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="speech.mp3"',
        'x-request-id': context.awsRequestId,
        'Cache-Control': 'no-cache'
      },
      body: pollyResponse.AudioStream.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Lambda error:', error);

    // Handle specific Polly errors
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error.code === 'InvalidParameterValue') {
      errorMessage = 'Invalid voice or parameter specified';
      statusCode = 400;
    } else if (error.code === 'TextLengthExceededException') {
      errorMessage = 'Text length exceeds maximum allowed';
      statusCode = 400;
    } else if (error.code === 'InvalidSsmlException') {
      errorMessage = 'Invalid SSML markup';
      statusCode = 400;
    }

    return {
      statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: errorMessage,
        details: error.message,
        requestId: context.awsRequestId
      })
    };
  }
};
```

### 2.3 Function Configuration

1. **Timeout**: Set to 30 seconds (Configuration → General)
2. **Memory**: 512 MB (adjust based on usage)
3. **Environment Variables**: Set `AWS_REGION` if needed

## Step 3: Create API Gateway

### 3.1 Create REST API

1. Go to API Gateway Console
2. Click "Create API"
3. Choose "REST API" → "Build"
4. API name: `text-to-speech-api`
5. Endpoint Type: "Regional"

### 3.2 Create Resource and Method

1. **Create Resource:**
   - Resource Name: `synthesize`
   - Resource Path: `/synthesize`
   - Enable CORS: Yes

2. **Create POST Method:**
   - Select `/synthesize` resource
   - Actions → Create Method → POST
   - Integration Type: Lambda Function
   - Lambda Function: `text-to-speech-converter`
   - Save and confirm permissions

3. **Create OPTIONS Method (for CORS):**
   - Select `/synthesize` resource
   - Actions → Create Method → OPTIONS
   - Integration Type: Mock
   - Save

### 3.3 Configure CORS

1. Select `/synthesize` resource
2. Actions → Enable CORS
3. Configure:
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - Access-Control-Allow-Methods: `GET,POST,OPTIONS`

### 3.4 Deploy API

1. Actions → Deploy API
2. Deployment stage: Create new stage `prod`
3. Stage name: `prod`
4. Deploy

Your API Gateway URL will be:
```
https://your-api-id.execute-api.region.amazonaws.com/prod
```

## Step 4: Test the Setup

### 4.1 Test Lambda Function

Create a test event in Lambda console:

```json
{
  "httpMethod": "POST",
  "body": "{\"text\":\"Hello world\",\"voiceId\":\"Joanna\",\"engine\":\"standard\"}"
}
```

### 4.2 Test API Gateway

Use curl to test the endpoint:

```bash
curl -X POST \
  https://your-api-id.execute-api.region.amazonaws.com/prod/synthesize \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Hello, this is a test of the text to speech system.",
    "voiceId": "Joanna",
    "engine": "standard"
  }' \
  --output test-audio.mp3
```

## Step 5: Frontend Configuration

Update your frontend `.env` file:

```env
VITE_AWS_API_GATEWAY_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
```

## Advanced Configuration

### Rate Limiting

Add rate limiting to API Gateway:

1. Go to API Gateway → Usage Plans
2. Create new usage plan
3. Set throttling limits (e.g., 100 requests/minute)
4. Associate with API stage

### Monitoring

Enable CloudWatch monitoring:

1. **Lambda**: Monitoring is enabled by default
2. **API Gateway**: Enable detailed CloudWatch metrics
3. **Set up alarms** for error rates and latency

### Security Enhancements

1. **API Keys**: Require API keys for access
2. **WAF**: Add AWS WAF for additional protection
3. **VPC**: Deploy Lambda in VPC if needed
4. **Encryption**: Enable encryption at rest and in transit

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure OPTIONS method is configured
   - Check CORS headers in Lambda response
   - Verify API Gateway CORS settings

2. **Permission Errors**
   - Check IAM role has Polly permissions
   - Verify Lambda execution role

3. **Timeout Issues**
   - Increase Lambda timeout
   - Check API Gateway timeout settings

4. **Audio Not Playing**
   - Verify Content-Type header is `audio/mpeg`
   - Check base64 encoding is correct
   - Test audio file directly

### Debugging

Enable detailed logging:

```javascript
// Add to Lambda function
console.log('Request event:', JSON.stringify(event, null, 2));
console.log('Polly response metadata:', pollyResponse.$response);
```

Check CloudWatch logs for detailed error information.

## Cost Optimization

1. **Right-size Lambda**: Start with 512MB, adjust based on usage
2. **Monitor usage**: Set up billing alerts
3. **Cache responses**: Consider caching common phrases
4. **Optimize text**: Remove unnecessary characters before processing

## Next Steps

1. **Add authentication** using AWS Cognito
2. **Implement caching** with ElastiCache or DynamoDB
3. **Add analytics** with AWS X-Ray
4. **Set up CI/CD** with AWS CodePipeline
5. **Add monitoring** with CloudWatch dashboards

This setup provides a robust, scalable backend for your Text-to-Speech application using AWS Lambda and Polly.