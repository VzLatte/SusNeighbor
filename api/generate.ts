import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const config = {
  runtime: 'edge', 
};

export default async function handler(req: Request) {
  // Security check: Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { requestType, mode, realProject, location, virusWord } = body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";
    let schema: any = {};

    // 1. Logic for generateAIPrompt
    if (requestType === 'INITIAL_PROMPT') {
      if (mode === 'TERMS' || mode === 'PAIR') {
        prompt = `Generate a pair of words for a social deduction game. Similar enough to be confused but distinct (e.g., 'Coffee' and 'Tea').`;
        schema = {
          type: SchemaType.OBJECT,
          properties: { wordA: { type: SchemaType.STRING }, wordB: { type: SchemaType.STRING } },
          required: ["wordA", "wordB"]
        };
      } else if (mode === 'VIRUS_PURGE') {
        prompt = `Generate a Co-op Virus Purge theme. Real Word: everyday noun. Virus Word: technical/malicious concept.`;
        schema = {
          type: SchemaType.OBJECT,
          properties: { realWord: { type: SchemaType.STRING }, virusWord: { type: SchemaType.STRING } },
          required: ["realWord", "virusWord"]
        };
      } else {
        prompt = `Generate a unique Urban Development project: facility name, location, and a strange catch rule.`;
        schema = {
          type: SchemaType.OBJECT,
          properties: { project: { type: SchemaType.STRING }, location: { type: SchemaType.STRING }, catch: { type: SchemaType.STRING } },
          required: ["project", "location", "catch"]
        };
      }
    }

    // 2. Logic for generateScenarioContext
    if (requestType === 'SCENARIO_CONTEXT') {
      prompt = `Real project: "${realProject}" at "${location}". Create 1 "imposterProject" (related but distinct) and 3 "distractors".`;
      schema = {
        type: SchemaType.OBJECT,
        properties: {
          imposterProject: { type: SchemaType.STRING },
          distractors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        },
        required: ["imposterProject", "distractors"]
      };
    }

    // 3. Logic for generateVirusNoiseWords
    if (requestType === 'VIRUS_NOISE') {
      prompt = `Generate 3 nouns strongly associated with "${virusWord}" but NOT "${realProject}". Return as noiseWords.`;
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
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}