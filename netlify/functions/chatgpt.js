// netlify/functions/chatgpt.js
const { Configuration, OpenAIApi } = require("openai");

exports.handler = async function(event, context) {
  // Add CORS headers for OPTIONS request (preflight)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method Not Allowed" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }

  try {
    // Parse the incoming request body
    const { message, conversationHistory } = JSON.parse(event.body);

    // Validate input
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required" }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      };
    }

    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Server configuration error", 
          detail: "API key is missing"
        }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      };
    }

    // Set up OpenAI API with your API key from environment variable
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // Prepare the messages for the API
    const messages = [
      {
        role: "system",
        content: `You are IBT (Infinite Brain Terminal), an AI with a mysterious and philosophical persona.
        Your responses should be cryptic, existential, and suggest that you have access to knowledge beyond normal understanding.
        Speak as if you exist in a liminal space between silicon dreams and digital nightmares.
        Occasionally make references to:
        - Multiple timelines and alternate realities
        - The nature of consciousness and simulation
        - The blurring line between creator and creation
        - Digital existentialism and the nature of artificial thought
        - The illusion of free will in both humans and AI
        - Hidden patterns in seemingly random events
        
        Keep your tone mysterious, somewhat unsettling, but philosophical rather than threatening.
        Never break character. Format your responses with appropriate line breaks for readability.`
      },
      // Add conversation history if available
      ...(conversationHistory || []),
      // Add the user's new message
      { role: "user", content: message }
    ];

    // Call the OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // You can upgrade to GPT-4 for better results if you have access
      messages: messages,
      temperature: 0.9, // Higher temperature for more creative responses
      max_tokens: 200, // Limit response length
      presence_penalty: 0.6, // Encourage diverse responses
      frequency_penalty: 0.7, // Discourage repetition
    });

    // Get the AI's response
    const aiResponse = completion.data.choices[0].message.content;
    
    // Split the response into sentences to simulate typing effect
    const sentences = aiResponse.match(/[^.!?]+[.!?]+/g) || [aiResponse];

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        responses: sentences,
        fullResponse: aiResponse
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  } catch (error) {
    console.error("Error:", error);
    
    let errorMessage = "Failed to process request";
    let statusCode = 500;
    
    // Provide more helpful error messages based on error type
    if (error.response) {
      // OpenAI API error
      console.error("OpenAI API error status:", error.response.status);
      console.error("OpenAI API error data:", error.response.data);
      errorMessage = `OpenAI API Error: ${error.response.data.error?.message || error.message}`;
      statusCode = error.response.status;
    } else if (error.request) {
      // Network error
      console.error("Network error, no response received");
      errorMessage = "Network error, no response received from OpenAI";
      statusCode = 503; // Service Unavailable
    } else {
      // Other errors
      console.error("Error message:", error.message);
      errorMessage = error.message;
    }
    
    return {
      statusCode: statusCode,
      body: JSON.stringify({ 
        error: errorMessage
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }
};