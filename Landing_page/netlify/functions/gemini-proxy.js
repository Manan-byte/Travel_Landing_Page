// netlify/functions/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function handler(event, context) {
  try {
    const { destination, days } = JSON.parse(event.body);

    // Ambil API Key dari environment variable Netlify
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Buatkan itinerary perjalanan ke ${destination} selama ${days} hari.`;

    const result = await model.generateContent(prompt);

    return {
      statusCode: 200,
      body: JSON.stringify({ plan: result.response.text() }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
