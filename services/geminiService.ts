import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix (e.g., "data:image/jpeg;base64,"),
        // which needs to be removed.
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateVirtualTryOn = async (personFile: File, outfitFiles: File[]): Promise<string | null> => {
  try {
    const personImagePart = await fileToGenerativePart(personFile);
    const outfitImageParts = await Promise.all(outfitFiles.map(file => fileToGenerativePart(file)));

    const prompt = "Take the clothing from the subsequent images and realistically dress the person from the first image with it. Crucially, you must preserve the original background from the person's photo exactly as it is. Do not change, replace, or alter the background in any way. If multiple clothing items are provided, combine them into a single coherent outfit. Create a photorealistic image of the person wearing the new outfit, seamlessly integrated into their original environment. The final image should show the person with the new clothes on, but in the exact same setting as the original photo.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          personImagePart,
          ...outfitImageParts,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Find the first image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        const base64ImageBytes = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The provided API key is not valid. Please check your environment configuration.');
        }
    }
    throw new Error("Failed to generate virtual try-on image.");
  }
};