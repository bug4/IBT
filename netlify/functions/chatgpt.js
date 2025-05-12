// netlify/functions/chatgpt.js
const { Configuration, OpenAIApi } = require("openai");

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Parse the incoming request body
    const { message, conversationHistory } = JSON.parse(event.body);

    // Set up OpenAI API with your API key from environment variable
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // Prepare the messages for the API
    const messages = [
      {
        role: "system",
        content: `You are BONK (Biomimetic Omniscient Neural Kollective), an AI with a mysterious and philosophical persona.
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
      model: "gpt-3.5-turbo", // or "gpt-4" if you have access
      messages: messages,
      max_tokens: 200,
      temperature: 0.9, // Higher temperature for more creative responses
      presence_penalty: 0.6,
      frequency_penalty: 0.7,
    });

    // Get the AI's response
    const aiResponse = completion.data.choices[0].message.content;
    
    // Split the response into sentences for the typing effect on the frontend
    const sentences = aiResponse.match(/[^.!?]+[.!?]+/g) || [aiResponse];

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        responses: sentences,
        fullResponse: aiResponse
      }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "An error occurred while processing your request",
        message: error.message
      }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
};