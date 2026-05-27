import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory mock DB for Rate Alerts created via API
const activeAlerts: any[] = [];

// Initialize Gemini SDK lazily to prevent crash if key is missing on startup.
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Create Rate Alert Subscription
app.post("/api/rate/subscribe", (req, res) => {
  const { email, originCurrency, targetRate, payoutMethod } = req.body;
  
  if (!email || !originCurrency || !targetRate || !payoutMethod) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newAlert = {
    id: `alert_${Date.now()}`,
    email,
    originCurrency,
    targetRate: parseFloat(targetRate),
    payoutMethod,
    createdAt: new Date().toISOString()
  };

  activeAlerts.push(newAlert);
  console.log(`[RateAlert] Added subscription for: ${email}`, newAlert);

  res.json({
    success: true,
    message: "Successfully subscribed to rate alerts!",
    alert: newAlert
  });
});

// Gemini Money Transfer Advisor Chat Route
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request messages array" });
    }

    const ai = getGeminiClient();

    // Map the messages format for Gemini generateContent / chats
    // Format: list of parts. Since we want historical context, we map roles:
    // User roles should be 'user', model roles should be 'model' (or use pure prompt wrapping)
    
    // We can compile a prompt that contains instructions + context + chat history
    let promptText = `You are "SendBetter ZW Remittance Advisor" - a highly friendly, smart, and knowledgeable AI assistant specializing in helping Zimbabweans in the diaspora (and their families back home) find the absolute finest, cheapest, and easiest ways to send money to Zimbabwe.

Keep your answers:
1. Highly customized and matching the user's origin country/currency (e.g., South Africa ZAR, United Kingdom GBP, United States/Global USD, Botswana BWP, Australia AUD, Canada CAD).
2. Deeply acquainted with the local Zimbabwean landscape. Mention real payout places: Mukuru booths, OK Supermarkets, Spar, TM Pick n Pay, Innbucks at Chicken Inn counters, Steward Bank, CBZ Bank, EcoCash agents, CABS, etc.
3. Realistic about cash pick-ups. Explain that USD Cash is extremely standard in Zimbabwe and is usually what family members prefer because of local exchange rates and US Dollar utility. Mention ZiG (Zimbabwe Gold) for local utilities, mobile wallets, or formal bank conversions.
4. Objective and direct! Tell them which option is best when they ask. Use bullet points for structural clarity.

Here is the conversation history so far:\n\n`;

    for (const msg of messages) {
      const sender = msg.role === "user" ? "User" : "Advisor";
      promptText += `${sender}: ${msg.text}\n`;
    }

    promptText += `\nAdvisor:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are a professional remittance advisor for sending money to Zimbabwe with deep domain knowledge of Mukuru, Wise, Innbucks, Ecocash, Western Union, and TapTap Send.",
        temperature: 0.75,
      }
    });

    const aiText = response.text || "I apologize, I didn't get that. How can I assist you with sending money to Zimbabwe?";
    
    res.json({
      success: true,
      text: aiText
    });

  } catch (error: any) {
    console.error("Gemini Advisor API error:", error);
    res.status(500).json({ 
      error: "Error processing advice", 
      details: error.message || error.toString() 
    });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER VS STATIC SERVING FOR PRODUCTION
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});
