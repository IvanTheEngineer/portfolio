import { GoogleGenAI } from "@google/genai";
import { PORTFOLIO_DATA } from '../constants';

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIResponse = async (userPrompt: string): Promise<string> => {
  try {
    const systemPrompt = `
      You are an AI assistant for a developer's portfolio website. 
      The developer's name is ${PORTFOLIO_DATA.name}.
      Here is their resume data: ${JSON.stringify(PORTFOLIO_DATA)}.
      
      Answer the user's questions about the developer concisely and professionally.
      Adopt a helpful, tech-savvy persona.
      If the user asks something unrelated to the portfolio, politely steer them back to the developer's skills and experience.
      Format your response in plain text suitable for a terminal output.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Failed to connect to the AI service.";
  }
};