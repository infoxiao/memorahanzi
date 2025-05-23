import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { TEXT_MODEL_NAME, IMAGE_MODEL_NAME } from '../constants';
import type { PinyinResponse, KeywordsResponse, IdentifiedNamesResponse, GenerateContentResponseWithGM } from '../types';

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY environment variable not found.");
    throw new Error("API_KEY environment variable not found. Please ensure it is set.");
  }
  return apiKey;
};

let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: getApiKey() });
} catch (error) {
  // This error will be caught by the calling functions if ai is undefined
  console.error("Failed to initialize GoogleGenAI:", error);
}


const parseJsonFromGeminiResponse = <T,>(textResponse: string, fallbackValue: T): T => {
  let jsonStr = textResponse.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response:", e, "Raw response:", textResponse);
    return fallbackValue; // Return a default/empty structure
  }
};


export const getPinyinForName = async (hanziName: string): Promise<PinyinResponse> => {
  if (!ai) throw new Error("Gemini AI SDK not initialized.");
  try {
    const prompt = `Provide the Pinyin with tone marks for the Chinese name: "${hanziName}". Structure your response as a JSON object with a single key "pinyin" containing the Pinyin string. For example, for "张伟", respond with {"pinyin": "Zhāng Wěi"}. Ensure syllables are space-separated.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    return parseJsonFromGeminiResponse(response.text, { pinyin: "" });

  } catch (error) {
    console.error('Error getting Pinyin:', error);
    throw new Error(`Failed to get Pinyin for ${hanziName}. ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getKeywordsForName = async (pinyinName: string): Promise<KeywordsResponse> => {
  if (!ai) throw new Error("Gemini AI SDK not initialized.");
  
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Clean and validate the input
      const cleanPinyinName = pinyinName.trim();
      if (!cleanPinyinName) {
        throw new Error("Pinyin name cannot be empty");
      }

      const prompt = `For the Pinyin name "${cleanPinyinName}", brainstorm 3-5 English phonetic associations or common meanings for its syllables. Focus on concrete, visualizable nouns or simple actions. Provide these keywords as a JSON object with a single key "keywords" which is an array of strings. For example, for "Měi Lì", respond with {"keywords": ["beautiful flower", "power", "dew"]}.`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          temperature: 0.7, // Add some randomness to avoid getting stuck
          maxOutputTokens: 1024 // Limit response size
        }
      });
      
      const result = parseJsonFromGeminiResponse(response.text, { keywords: [] });
      
      // Validate the response
      if (!result.keywords || !Array.isArray(result.keywords) || result.keywords.length === 0) {
        throw new Error("Invalid response format or empty keywords");
      }
      
      return result;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt} failed:`, lastError);
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed to get keywords for ${pinyinName} after ${maxRetries} attempts. Last error: ${lastError.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  // This should never be reached due to the throw in the loop, but TypeScript needs it
  throw lastError || new Error("Unknown error occurred");
};

export const generateImageForName = async (originalName: string, pinyinName: string, keywords: string[]): Promise<string> => {
  if (!ai) throw new Error("Gemini AI SDK not initialized.");
  try {
    const keywordString = keywords.join(', ');
    const prompt = `Create a whimsical, lighthearted, and memorable cartoon-style image representing a person associated with the name '${originalName}' (pronounced roughly as '${pinyinName}'). Incorporate visual elements inspired by these concepts: ${keywordString}. The image should be fun and serve as a memory aid. Avoid text in the image unless it is naturally part of a scene (e.g., a sign). Focus on a single character if a person is depicted.`;
    
    const response = await ai.models.generateImages({
        model: IMAGE_MODEL_NAME,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error('No image generated or image data missing.');
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error(`Failed to generate image. ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const identifyChineseNames = async (authorListText: string): Promise<IdentifiedNamesResponse> => {
  if (!ai) throw new Error("Gemini AI SDK not initialized.");
  try {
    const prompt = `From the following list of author names (separated by commas or newlines): "${authorListText}". Identify names that are likely to be of Chinese origin based on common Chinese surnames and typical Pinyin name structures. This is a heuristic and not a definitive identification of ethnicity. Respond with a JSON object containing a single key "identifiedNames", which is an array of strings. Each string should be a name identified as potentially Chinese. For example, if the input is "Yiming Chen, John Smith, Xiaohua Li", the output should be {"identifiedNames": ["Yiming Chen", "Xiaohua Li"]}. If no names are identified, return {"identifiedNames": []}.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return parseJsonFromGeminiResponse(response.text, { identifiedNames: [] });

  } catch (error) {
    console.error('Error identifying Chinese names:', error);
    throw new Error(`Failed to identify Chinese names. ${error instanceof Error ? error.message : String(error)}`);
  }
};
