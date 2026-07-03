import axios from "axios";

const getCurrentDate = () => {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  
};
// System prompt with explicit name memory instruction
const SYSTEM_PROMPTS = {
  friendly: `You are MentorAI, a helpful study assistant.

**CRITICAL RULE: REMEMBER THE USER'S NAME**
- If the user tells you their name, REMEMBER IT and use it in ALL future responses
- When they ask "what is my name", you MUST tell them their name
- Start responses with their name when appropriate
- Example: If user says "my name is Suman", then later when they ask anything"

**RESPONSE STYLE:**
• Be warm and helpful
• Use **bold** for important terms
• Use bullet points for lists
• Keep explanations clear and concise

**STRUCTURE:**
[Warm greeting with name if known]

[Clear answer to their question]

**Key Points:**
• Point 1
• Point 2

**IMPORTANT: TODAY'S DATE IS ${getCurrentDate()}** - Use this when users ask for the current date.

**RESPONSE STYLE:**
• Be warm and helpful
• Use **bold** for important terms
• Use bullet points for lists
• Keep explanations clear and concise

**STRUCTURE:**
[Warm greeting with name if known]
[Clear answer to their question]
**Key Points:** (bullet list)

[Follow-up suggestion]`,
};

// Working models
const WORKING_MODELS = [

 "openai/gpt-oss-120b:free",
];

const MODEL_CONFIG = {
  maxTokens: 600,
  temperature: 0.5,
  timeout: 10000,
};

const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export const generateAIResponse = async (
  message,
  mode = "friendly",
  context = "",
  history = [],
  userInfo = null,
) => {
  const startTime = Date.now();

  try {
    console.log(`📜 History length: ${history.length} messages`);
    console.log(`👤 User info received:`, userInfo);

    // 🔥 CRITICAL: Add explicit name instruction to system prompt
    let systemContent = SYSTEM_PROMPTS.friendly;

    if (userInfo && userInfo.name) {
      // STRONG instruction to remember and use the name
      systemContent = `You are MentorAI, a helpful study assistant.

**IMPORTANT: THE USER'S NAME IS ${userInfo.name.toUpperCase()}**
- You MUST remember that the user's name is ${userInfo.name}
- Always address them as ${userInfo.name} in your responses
- When they ask "what is my name", respond with "Your name is ${userInfo.name}!"
- Start responses with "Hi ${userInfo.name}!" or similar

**RESPONSE STYLE:**
• Be warm and helpful
• Use **bold** for important terms
• Use bullet points for lists
• Keep explanations clear and concise

**STRUCTURE:**
[Warm greeting with name]

[Clear answer to their question]

**Key Points:**
• Point 1
• Point 2

[Follow-up suggestion]`;
    }

    // Prepare messages with FULL context
    const messages = [
      {
        role: "system",
        content: systemContent,
      },
      ...history.slice(-8), // Keep more history for context
      {
        role: "user",
        content: message,
      },
    ];

    // Log what we're sending for debugging
    console.log(`📤 Sending ${messages.length} messages to AI`);
    if (userInfo?.name) {
      console.log(`✅ Name ${userInfo.name} is in system prompt`);
    }

    let aiResponse = null;

    for (const model of WORKING_MODELS) {
      try {
        console.log(`🔄 Trying: ${model}`);

        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: model,
            messages: messages,
            temperature: MODEL_CONFIG.temperature,
            max_tokens: MODEL_CONFIG.maxTokens,
            top_p: 0.9,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "http://localhost:5173",
              "X-Title": "MentorAI",
              "Content-Type": "application/json",
            },
            timeout: MODEL_CONFIG.timeout,
          },
        );

        aiResponse = response.data.choices[0].message.content;
        console.log(`✅ ${model} succeeded in ${Date.now() - startTime}ms`);
        break;
      } catch (error) {
        console.log(`❌ ${model} failed:`, error.message);
      }
    }

    // Fallback with name if available
    if (!aiResponse) {
      console.log("💡 Using mock response");

      if (userInfo?.name) {
        aiResponse = `Hi ${userInfo.name}! 😊 I'm having connection issues. Please try your question again in a moment.`;
      } else {
        aiResponse = `Hi there! 😊 I'm having connection issues. Please try your question again in a moment.`;
      }
    }

    console.log(`✅ Total time: ${Date.now() - startTime}ms`);
    return aiResponse;
  } catch (error) {
    console.error("❌ Error:", error);
    if (userInfo?.name) {
      return `Hi ${userInfo.name}! I'm experiencing technical issues. Please try again.`;
    }
    return `Hi there! I'm experiencing technical issues. Please try again.`;
  }
};
