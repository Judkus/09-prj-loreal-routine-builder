# L'Oréal Smart Routine & Product Advisor - Enhanced Web Search Setup

This project now includes enhanced web search capabilities that provide real-time information about L'Oréal products, current beauty trends, and up-to-date product information with citations.

## Features

### Enhanced Web Search Capabilities

- **Real-time product information**: Get current L'Oréal product details, availability, and pricing
- **Recent launches**: Stay updated on new product releases and innovations
- **Current beauty trends**: Access the latest beauty techniques and trends
- **Cited sources**: All responses include links and citations to authoritative sources
- **Intelligent filtering**: Searches are filtered to prioritize official L'Oréal and trusted beauty websites

### User Experience Improvements

- **Clickable links**: All citations are converted to clickable links in the chat interface
- **Fallback system**: If web search fails, the system falls back to OpenAI with a notification
- **Loading indicators**: Clear feedback during search operations
- **Enhanced formatting**: Better presentation of search results with proper styling

## Setup Instructions

### 1. Cloudflare Worker Configuration

You'll need to update your Cloudflare Worker with the new code and add environment variables:

#### Required Environment Variables:

1. **PERPLEXITY_API_KEY** (Primary): Get from [Perplexity AI](https://www.perplexity.ai/)
2. **OPENAI_API_KEY** (Fallback): Your existing OpenAI API key

#### Steps:

1. Go to your Cloudflare Workers dashboard
2. Select your worker (or create a new one)
3. Replace the code with the updated `Cloudflare-worker.js`
4. Add the environment variables in Settings > Environment Variables:
   - `PERPLEXITY_API_KEY`: Your Perplexity AI API key
   - `OPENAI_API_KEY`: Your OpenAI API key (existing)

### 2. Getting a Perplexity AI API Key

1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account
3. Go to your account settings
4. Generate an API key
5. Add the key to your Cloudflare Worker environment variables

### 3. Deploy the Updated Worker

1. Deploy your updated Cloudflare Worker
2. Test the deployment by visiting your worker URL
3. Update the worker URL in your `script.js` if it changed

## How It Works

### Web Search Integration

The system uses Perplexity AI's `llama-3.1-sonar-large-128k-online` model, which:

- Searches the web in real-time
- Filters results to focus on beauty and L'Oréal-related content
- Provides citations and links to sources
- Prioritizes recent information (within the last month)

### Domain Filtering

The search is filtered to prioritize these trusted domains:

- loreal.com
- lorealparisusa.com
- maybelline.com
- urbandecay.com
- ysl.com
- ulta.com
- sephora.com
- allure.com
- elle.com
- vogue.com

### Response Processing

1. User submits a question
2. System searches for current information
3. Results are formatted with clickable links
4. Citations are appended to responses
5. Links are styled to match the L'Oréal brand

## Usage Examples

### Chat Queries

Users can now ask questions like:

- "What are the latest L'Oréal skincare products for 2025?"
- "How do I use the new L'Oréal Revitalift serum?"
- "What are the current beauty trends for winter 2025?"
- "Are there any new L'Oréal hair color products this season?"

### Routine Generation

When generating routines, the system will:

- Search for current application techniques
- Include recent product updates
- Provide links to official instructions
- Reference current beauty professional recommendations

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure both API keys are properly set in Cloudflare Workers
2. **CORS Issues**: The worker handles CORS automatically
3. **Rate Limits**: Perplexity AI has rate limits; the system will fall back to OpenAI
4. **Network Errors**: Check your Cloudflare Worker logs for detailed error messages

### Testing the Integration

1. Open your application
2. Ask a question about current L'Oréal products
3. Check if the response includes citations and links
4. Verify that links are clickable and properly formatted

## Benefits

- **Current Information**: Always get the latest product information
- **Authoritative Sources**: Links to official L'Oréal and trusted beauty websites
- **Enhanced User Experience**: Clickable links and proper formatting
- **Reliability**: Fallback system ensures the app works even if web search fails
- **Brand Consistency**: All styling maintains L'Oréal brand colors and themes

## Future Enhancements

- Image search integration for product visuals
- Price comparison across retailers
- Seasonal trend analysis
- User review aggregation
- Personalized recommendations based on search history

## Security Notes

- API keys are stored securely in Cloudflare Workers environment
- All external links open in new tabs for security
- Rate limiting prevents API abuse
- Error handling prevents sensitive information exposure

## Support

If you encounter issues:

1. Check Cloudflare Worker logs
2. Verify API key permissions
3. Test with simple queries first
4. Check network connectivity
5. Review the console for JavaScript errors

## API Documentation

### Perplexity AI

- Documentation: https://docs.perplexity.ai/
- Model: llama-3.1-sonar-large-128k-online
- Features: Real-time web search, citations, filtering

### OpenAI (Fallback)

- Documentation: https://platform.openai.com/docs
- Model: gpt-4o
- Used when Perplexity AI is unavailable
