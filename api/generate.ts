import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const config = {
  runtime: 'edge', 
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { requestType, mode, realProject, location, virusWord, realWord } = body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    
    // Use Pro for complex reasoning tasks, Flash for simple generation
    const modelName = (requestType === 'INITIAL_PROMPT') ? "gemini-1.5-flash" : "gemini-1.5-pro";
    const model = genAI.getGenerativeModel({ model: modelName });

    let prompt = "";
    let schema: any = {};

    // 1. Matching INITIAL_PROMPT logic
    if (requestType === 'INITIAL_PROMPT') {
      if (mode === 'TERMS' || mode === 'PAIR') {
        prompt = `Generate a pair of words for a social deduction game. The words should be similar enough to be confused but distinct. (e.g., 'Coffee' and 'Tea', 'Lion' and 'Tiger').`;
        schema = {
          type: SchemaType.OBJECT,
          properties: { wordA: { type: SchemaType.STRING }, wordB: { type: SchemaType.STRING } },
          required: ["wordA", "wordB"]
        };
      } else if (mode === 'SCHEME' || mode === 'INVESTMENT') {
        prompt = `Generate a unique Urban Development project for a social deduction game.
        1. Project: A specific facility (e.g., 'Aquarium', 'Observatory').
        2. Location: Where it is built (e.g., 'Mountain Peak', 'Old Harbor').
        3. Catch: A strange rule for the facility (e.g., 'No gravity', 'Whispering only').`;
        schema = {
          type: SchemaType.OBJECT,
          properties: {
            project: { type: SchemaType.STRING },
            location: { type: SchemaType.STRING },
            catch: { type: SchemaType.STRING }
          },
          required: ["project", "location", "catch"]
        };
      } else if (mode === 'VIRUS_PURGE') {
        prompt = `Generate a theme for a Co-op Virus Purge game.
        1. Real Word: An everyday noun (e.g., 'Umbrella').
        2. Virus Word: A technical or malicious concept (e.g., 'Encryption').`;
        schema = {
          type: SchemaType.OBJECT,
          properties: { realWord: { type: SchemaType.STRING }, virusWord: { type: SchemaType.STRING } },
          required: ["realWord", "virusWord"]
        };
      }
    }

    // 2. Matching SCENARIO_CONTEXT logic
    if (requestType === 'SCENARIO_CONTEXT') {
      prompt = `We are playing a secret role game. The real project is "${realProject}" and the location is "${location}". 
      1. Create one "Similar Project" for the imposter. It should be related but distinct enough to cause confusion.
      2. Create three "Distractor Projects" for a multiple choice quiz. These should also be somewhat plausible.
      Return the result in JSON format.`;
      schema = {
        type: SchemaType.OBJECT,
        properties: {
          imposterProject: { type: SchemaType.STRING },
          distractors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["imposterProject", "distractors"]
      };
    }

    // 3. Matching VIRUS_NOISE logic
    if (requestType === 'VIRUS_NOISE') {
      prompt = `Co-op game logic: Humans describe "${realWord}". The hidden "Virus" word is "${virusWord}". 
      Generate 3 nouns that are strongly associated with "${virusWord}" but are NOT typically used to describe "${realWord}". 
      These will act as 'clues' to the virus word that humans must avoid mentioning.
      Return in JSON format.`;
      schema = {
        type: SchemaType.OBJECT,
        properties: { noiseWords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } } },
        required: ["noiseWords"]
      };
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    return new Response(result.response.text(), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}