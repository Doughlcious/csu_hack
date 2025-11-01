import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
    apiKey:process.env.GOOGLE_GEMINI_API_KEY,
});

export async function GET() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    role:"user",
    contents:[
  {
    "recipeName": "To provide you with the most helpful and accurate information as HERB, I need a bit more detail about your current health. Please provide the patient's information using the following template:",
    "ingredients": [
      "Patient is [AGE] year old [SEX]. They weigh [WEIGHT] lbs and are [HEIGHT_FT] ft [HEIGHT_IN] in tall.",
      "Patient has [PHYSICAL_CONDITIONS].",
      "Patient has a history of [MENTAL_CONDITIONS].",
      "Patient has/has not been vaccinated recently.",
      "Patient is currently taking [MEDICATIONS].",
      "Please also describe your main symptoms, including: what they feel like, where they are located, when they started, how long they've lasted, and anything that makes them better or worse. This will help me provide a more informed response."
    ]
  }
]
,

    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            recipeName: {
              type: Type.STRING,
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
          propertyOrdering: ["recipeName", "ingredients"],
        },
      },
    },
  });

return NextResponse.json(JSON.parse(response.text));
}
