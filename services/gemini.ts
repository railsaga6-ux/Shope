
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI SDK with the API key from environment variables.
// Always use the strict named parameter format.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a compelling and concise e-commerce description (max 2 sentences) for a product named "${productName}" in the "${category}" category. Focus on luxury and utility.`,
    });
    // Access response.text as a property, not a method.
    return response.text?.trim() || "Quality product for our premium customers.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const getSmartSuggestions = async (userHistory: string[]): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on these recently viewed items: ${userHistory.join(', ')}, suggest 3 trending tech categories that would interest this user. Return as a plain comma-separated list.`,
    });
    return response.text?.split(',').map(s => s.trim()) || [];
  } catch (error) {
    return ["Tech", "Innovation", "Luxury"];
  }
};
