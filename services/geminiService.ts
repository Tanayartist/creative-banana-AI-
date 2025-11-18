
import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile, StyleOptions } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (image: ImageFile) => {
  return {
    inlineData: {
      data: image.base64,
      mimeType: image.mimeType,
    },
  };
};

export const generatePrompt = async (
  styleOptions: StyleOptions,
  styleReferenceImage?: ImageFile
): Promise<string> => {
  const { aspectRatio, lightingStyle, cameraPerspective } = styleOptions;
  const model = 'gemini-2.5-flash';
  
  let promptParts: (string | { inlineData: { data: string, mimeType: string } })[] = [
    `Generate a super-detailed, professional photography prompt for an AI image generator. The goal is to create a photorealistic shot of a product.`,
    `\n**Key Directives:**\n`,
    `- Aspect Ratio: ${aspectRatio}\n`,
    `- Lighting Style: ${lightingStyle}\n`,
    `- Camera Perspective: ${cameraPerspective}\n`,
    `\n**Task:**\n`,
    `Based on the directives above`,
  ];
  
  if (styleReferenceImage) {
    promptParts.push(` and the style of the provided reference image, create a prompt. Describe the reference image's key visual elements (e.g., color palette, mood, textures, composition, background) and incorporate them into the final prompt. The final prompt should be a single, cohesive paragraph that describes the desired image in vivid detail. Do not add any conversational text, just output the prompt itself.`);
    promptParts.push(fileToGenerativePart(styleReferenceImage));
  } else {
    promptParts.push(`, create a prompt. The final prompt should be a single, cohesive paragraph that describes the desired image in vivid detail. Do not add any conversational text, just output the prompt itself.`);
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: promptParts.map(p => typeof p === 'string' ? { text: p } : p) }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating prompt:", error);
    return "Error: Could not generate prompt.";
  }
};

export const generateImage = async (
  productImage: ImageFile,
  prompt: string,
  styleReferenceImage?: ImageFile
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';

  let parts = [
    fileToGenerativePart(productImage),
    { text: prompt }
  ];

  if (styleReferenceImage) {
    parts.push(fileToGenerativePart(styleReferenceImage));
  }
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please check the console for details.");
  }
};
