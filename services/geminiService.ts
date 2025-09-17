import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateKeywords = async (topic: string): Promise<string[]> => {
  if (!topic.trim()) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5-10 relevant SEO keywords for a recipe blog article about "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    if (result && Array.isArray(result.keywords)) {
      return result.keywords;
    }
    return [];
  } catch (error) {
    console.error("Error generating keywords:", error);
    return [];
  }
};

export const generateTitle = async (keywords: string): Promise<string> => {
  if (!keywords.trim()) return "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a catchy, SEO-friendly blog post title for a recipe article based on these keywords: "${keywords}". Return only the title as a single string.`,
    });
    return response.text.trim().replace(/^"|"$/g, ''); // Remove quotes if AI adds them
  } catch (error) {
    console.error("Error generating title:", error);
    return "";
  }
};
