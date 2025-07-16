export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const userInput = await request.json();

      // Use Perplexity AI for web search capabilities
      const perplexityApiKey = env.PERPLEXITY_API_KEY; // Add this secret to your Cloudflare Workers dashboard
      const perplexityApiUrl = "https://api.perplexity.ai/chat/completions";

      // Enhanced system prompt for L'Oréal-specific searches
      const systemPrompt = `You are a helpful L'Oréal beauty advisor with access to real-time information. 
      When users ask about L'Oréal products, routines, or beauty trends, search for the most current information available.
      Always prioritize official L'Oréal information, recent product launches, ingredient updates, and current beauty trends.
      Include relevant links and citations in your responses when available.
      Focus on providing accurate, up-to-date information about:
      - L'Oréal product availability and pricing
      - New product launches and innovations
      - Current beauty trends and techniques
      - Ingredient information and benefits
      - Professional recommendations and reviews
      Format your response to be helpful and informative while maintaining the L'Oréal brand voice.`;

      // Prepare messages for Perplexity API
      const messages = [
        { role: "system", content: systemPrompt },
        ...userInput.messages.filter((msg) => msg.role !== "system"), // Remove any existing system message
      ];

      const requestBody = {
        model: "llama-3.1-sonar-large-128k-online", // Perplexity's web search model
        messages: messages,
        max_tokens: 400,
        temperature: 0.7,
        search_domain_filter: [
          "loreal.com",
          "lorealparisusa.com",
          "maybelline.com",
          "urbandecay.com",
          "ysl.com",
          "ulta.com",
          "sephora.com",
          "allure.com",
          "elle.com",
          "vogue.com",
        ],
        return_citations: true,
        search_recency_filter: "month", // Prioritize recent information
      };

      const response = await fetch(perplexityApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${perplexityApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();

      // Format the response to include citations in a user-friendly way
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        const citations = data.citations || [];

        // Append citations to the response if available
        if (citations.length > 0) {
          const citationText =
            "\n\n**Sources:**\n" +
            citations
              .map(
                (citation, index) =>
                  `${index + 1}. [${citation.title || citation.url}](${
                    citation.url
                  })`
              )
              .join("\n");
          data.choices[0].message.content = content + citationText;
        }
      }

      return new Response(JSON.stringify(data), { headers: corsHeaders });
    } catch (error) {
      console.error("Error:", error);

      // Fallback to OpenAI if Perplexity fails
      try {
        const openaiApiKey = env.OPENAI_API_KEY;
        const openaiApiUrl = "https://api.openai.com/v1/chat/completions";
        const userInput = await request.json();

        const fallbackRequestBody = {
          model: "gpt-4o",
          messages: userInput.messages,
          max_completion_tokens: 300,
        };

        const fallbackResponse = await fetch(openaiApiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fallbackRequestBody),
        });

        const fallbackData = await fallbackResponse.json();

        // Add a note about limited real-time information
        if (
          fallbackData.choices &&
          fallbackData.choices[0] &&
          fallbackData.choices[0].message
        ) {
          fallbackData.choices[0].message.content +=
            "\n\n*Note: This response may not include the most current information. For the latest L'Oréal products and updates, please visit loreal.com*";
        }

        return new Response(JSON.stringify(fallbackData), {
          headers: corsHeaders,
        });
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        return new Response(
          JSON.stringify({
            error:
              "Sorry, I'm having trouble accessing current information right now. Please try again later.",
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }
  },
};
