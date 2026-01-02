
import { GoogleGenAI, Type } from "@google/genai";
import { MainMode } from "../types";

export async function generateAIPrompt(mode: MainMode) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let prompt = "";
    let schema: any = {};

    if (mode === MainMode.TERMS || mode === MainMode.PAIR) {
      prompt = `Generate a pair of words for a social deduction game. The words should be similar enough to be confused but distinct. (e.g., 'Coffee' and 'Tea', 'Lion' and 'Tiger').`;
      schema = {
        type: Type.OBJECT,
        properties: {
          wordA: { type: Type.STRING },
          wordB: { type: Type.STRING }
        },
        required: ["wordA", "wordB"]
      };
    } else if (mode === MainMode.SCHEME || mode === MainMode.INVESTMENT) {
      prompt = `Generate a unique Urban Development project for a social deduction game.
      1. Project: A specific facility (e.g., 'Aquarium', 'Observatory').
      2. Location: Where it is built (e.g., 'Mountain Peak', 'Old Harbor').
      3. Catch: A strange rule for the facility (e.g., 'No gravity', 'Whispering only').`;
      schema = {
        type: Type.OBJECT,
        properties: {
          project: { type: Type.STRING },
          location: { type: Type.STRING },
          catch: { type: Type.STRING }
        },
        required: ["project", "location", "catch"]
      };
    } else if (mode === MainMode.VIRUS_PURGE) {
      prompt = `Generate a theme for a Co-op Virus Purge game.
      1. Real Word: An everyday noun (e.g., 'Umbrella').
      2. Virus Word: A technical or malicious concept (e.g., 'Encryption').`;
      schema = {
        type: Type.OBJECT,
        properties: {
          realWord: { type: Type.STRING },
          virusWord: { type: Type.STRING }
        },
        required: ["realWord", "virusWord"]
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    if (error?.status === 429) {
      console.warn("Gemini API Rate Limit Reached (429). Mission data will use local fallbacks.");
    } else {
      console.error("AI Prompt Gen Error:", error);
    }
    return null;
  }
}

export async function generateScenarioContext(realProject: string, location: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `We are playing a secret role game. The real project is "${realProject}" and the location is "${location}". 
      1. Create one "Similar Project" for the imposter. It should be related but distinct enough to cause confusion.
      2. Create three "Distractor Projects" for a multiple choice quiz. These should also be somewhat plausible.
      Return the result in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            imposterProject: { type: Type.STRING },
            distractors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["imposterProject", "distractors"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error: any) {
    if (error?.status === 429) {
      console.warn("Gemini API Rate Limit Reached (429) during scenario expansion.");
    } else {
      console.error("Gemini Error:", error);
    }
    return {
      imposterProject: `Alternative ${realProject}`,
      distractors: ["Library", "Park", "Museum"]
    };
  }
}

export async function generateVirusNoiseWords(realWord: string, virusWord: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Co-op game logic: Humans describe "${realWord}". The hidden "Virus" word is "${virusWord}". 
      Generate 3 nouns that are strongly associated with "${virusWord}" but are NOT typically used to describe "${realWord}". 
      These will act as 'clues' to the virus word that humans must avoid mentioning.
      Return in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            noiseWords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["noiseWords"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error: any) {
    if (error?.status === 429) {
      console.warn("Gemini API Rate Limit Reached (429) during Virus analysis.");
    } else {
      console.error("Virus AI Error:", error);
    }
    return { noiseWords: ["System", "Code", "Glitch"] };
  }
}
