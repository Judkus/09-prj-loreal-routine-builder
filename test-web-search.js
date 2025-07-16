// Test script to verify web search functionality
// This can be run in the browser console to test the API integration

async function testWebSearch() {
  console.log("Testing web search functionality...");

  try {
    const response = await fetch(
      "https://lorealproject9.kussuejh.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "What are the latest L'Oréal skincare products launched in 2025?",
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("API Response:", data);

    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log("✅ Web search is working!");
      console.log("Response content:", data.choices[0].message.content);
    } else if (data.error) {
      console.log("❌ API Error:", data.error);
    } else {
      console.log("❌ Unexpected response format");
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}

// Test the link formatting function
function testLinkFormatting() {
  const testText =
    "Check out this product: [L'Oréal Revitalift](https://www.loreal.com/revitalift) and also [Sephora Review](https://www.sephora.com/review)";

  function formatResponseWithLinks(text) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(
      linkRegex,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }

  const formatted = formatResponseWithLinks(testText);
  console.log("Original:", testText);
  console.log("Formatted:", formatted);

  // Test if links are properly formatted
  if (formatted.includes("<a href=") && formatted.includes('target="_blank"')) {
    console.log("✅ Link formatting is working!");
  } else {
    console.log("❌ Link formatting failed");
  }
}

// Run tests
console.log("=== Web Search Integration Tests ===");
testLinkFormatting();
// testWebSearch(); // Uncomment to test API (requires valid API key)
