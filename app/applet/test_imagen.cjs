import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(); // Defaults to process.env.GEMINI_API_KEY

async function test() {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: 'A futuristic city',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9'
      }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      console.log('Success! Image base64 length:', response.generatedImages[0].image.imageBytes.length);
    } else {
      console.log('No image returned');
    }
  } catch (error) {
    console.error('Failed:', error.message);
  }
}

test();
