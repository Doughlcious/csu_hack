import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
    apiKey:process.env.GOOGLE_GEMINI_API_KEY,
});

export async function GET() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "write a small rap song about hackathon",
  });

  return NextResponse.json(response.text);
}

