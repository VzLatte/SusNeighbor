import { MainMode } from "../types";

async function callAIApi(payload: object) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('AI Route Failed');
  return await response.json();
}

export async function generateAIPrompt(mode: MainMode) {
  try {
    return await callAIApi({ requestType: 'INITIAL_PROMPT', mode });
  } catch (e) {
    return null; // Triggers your local fallbacks
  }
}

export async function generateScenarioContext(realProject: string, location: string) {
  try {
    return await callAIApi({ requestType: 'SCENARIO_CONTEXT', realProject, location });
  } catch (e) {
    return { imposterProject: `Alternative ${realProject}`, distractors: ["Library", "Park", "Gym"] };
  }
}

export async function generateVirusNoiseWords(realWord: string, virusWord: string) {
  try {
    return await callAIApi({ requestType: 'VIRUS_NOISE', realWord, virusWord });
  } catch (e) {
    return { noiseWords: ["System", "Data", "Glitch"] };
  }
}