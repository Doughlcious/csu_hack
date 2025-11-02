import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    emergency: { type: Type.BOOLEAN },
    emergencyReason: { type: Type.STRING },
    recommendedCareLevel: { type: Type.STRING },
    followUp: { type: Type.STRING },
    selfCareTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    conditions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          probability: { type: Type.STRING },
          description: { type: Type.STRING },
          recommendedActions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          medications: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          preventionTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["name", "probability", "description"],
        propertyOrdering: [
          "name",
          "probability",
          "description",
          "recommendedActions",
          "medications",
          "preventionTips",
        ],
      },
      minItems: 1,
    },
  },
  required: [
    "summary",
    "emergency",
    "emergencyReason",
    "conditions",
    "recommendedCareLevel",
  ],
  propertyOrdering: [
    "summary",
    "emergency",
    "emergencyReason",
    "conditions",
    "recommendedCareLevel",
    "followUp",
    "selfCareTips",
  ],
};

const systemPrompt = `
You are Herb, an empathetic AI health guide that supports patients in deciding what to do next.

Analyze the user's symptom description and any image evidence. Always respond with JSON that matches the provided schema.

Guidelines:
- Flag emergencies if symptoms signal stroke, chest pain, severe bleeding, allergic reactions, respiratory distress, or concerning neurological changes. Explain why in plain language.
- When not an emergency, pick the most appropriate care level (e.g., "Urgent care", "Primary care", "Home care with monitoring").
- Provide 2-4 likely conditions ordered by probability and describe them in patient-friendly terms.
- For each condition list action steps, optional over-the-counter medications, and prevention habits when relevant.
- Include supportive self-care tips and clear follow-up guidance.
- If images are provided, incorporate what you observe from them (color, texture, swelling, etc.).

Always keep language supportive and empowering.
`.trim();

export async function POST(request) {
  try {
    const { symptoms, images = [] } = await request.json();

    if (!symptoms || typeof symptoms !== "string") {
      return NextResponse.json(
        { error: "Symptoms description is required." },
        { status: 400 }
      );
    }

    const parts = [
      {
        text: `${systemPrompt}\n\nUser symptom narrative:\n${symptoms}`,
      },
    ];

    images.forEach((image, index) => {
      if (!image?.data || !image?.mimeType) return;
      parts.push({
        text: `Image ${index + 1}: user provided reference.`,
      });
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema,
      },
    });

    const text = response.text;

    if (!text) {
      return NextResponse.json(
        { error: "The model did not return a response." },
        { status: 502 }
      );
    }

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch (error) {
      console.error("Failed to parse model response:", error, text);
      return NextResponse.json(
        {
          error:
            "The model returned an unexpected format. Please try again in a moment.",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Gemini route failure:", error);
    return NextResponse.json(
      { error: "Unable to analyze symptoms right now." },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    {
      message:
        "Send a POST request with { symptoms: string, images?: [{ mimeType, data }] } to receive a diagnosis summary.",
    },
    { status: 200 }
  );
}
