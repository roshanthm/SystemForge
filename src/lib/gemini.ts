import { GoogleGenAI, Type } from "@google/genai";
import { SystemDesign } from "../types";

export interface GenerationStep {
  step: number;
  label: string;
  content: string;
  isComplete: boolean;
  data?: SystemDesign;
}

export async function* generateSystemDesignStream(prompt: string): AsyncGenerator<GenerationStep> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing. Please check your AI Studio secrets.");
    throw new Error("API Key is missing. Please configure it in the Secrets panel.");
  }

  const genAI = new GoogleGenAI({ apiKey });

  try {
    const responseStream = await genAI.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: `You are an expert software architect, product strategist, and hackathon-winning system designer.
Convert this idea into an INNOVATIVE, PRACTICAL, ETHICAL, and DEMO-READY system: "${prompt}"

Respond in EXACTLY 5 STEPS. Each step must be clearly labeled as "Step X: Label".

Step 1: Understanding the idea
- Briefly interpret the user's idea, its core value proposition, and its market potential.

Step 2: Identifying core components & Intelligence
- List major components (frontend, backend, database, services) and the intelligence layer.

Step 3: Designing architecture & Innovation
- Explain the modular/advanced architecture, design choices, and unique innovations.

Step 4: Generating system structure
- Provide the system architecture as a valid JSON object. 
- The JSON must follow the schema provided in the system instructions.
- Wrap the JSON in a code block like this: \`\`\`json { ... } \`\`\`
- DO NOT add any text before or after the JSON in this step.

Step 5: Final explanation
- Explain how the system works end-to-end, why it's demo-ready, and its potential impact.`,
      config: {
        systemInstruction: `You are a SYSTEM DESIGN ENGINE. 
Follow the 5-step process exactly. 
In Step 4, you MUST provide a valid JSON object following this schema:
{
  "system_name": string,
  "description": string,
  "architecture": { 
    "overview": string, 
    "type": "modular" | "event-driven" | "monolith" | "microservices" | "serverless",
    "design_choice_reason": string,
    "advanced_elements": Array<string>,
    "simplified_prototype": string
  },
  "components": Array<{ "id": string, "name": string, "type": "frontend" | "backend" | "database" | "service", "responsibility": string }>,
  "connections": Array<{ "from": string, "to": string, "data_flow": string }>,
  "features": Array<string>,
  "innovations": Array<{ "title": string, "description": string }>,
  "intelligence_layer": Array<{ "capability": string, "description": string }>,
  "human_value": Array<string>,
  "business_value": Array<string>,
  "impact_metrics": Array<string>,
  "demo_highlight": string,
  "prototype_scope": Array<string>,
  "fallback_mode": string,
  "user_experience": Array<string>,
  "user_control": Array<string>,
  "ethical_considerations": Array<string>,
  "tech_stack": { 
    "frontend": "React", 
    "backend": "Node.js", 
    "database": string, 
    "realtime": string,
    "other_tools": Array<string>,
    "optional": Array<string>
  },
  "folder_structure": Array<{ "path": string, "purpose": string }>,
  "code_samples": { "frontend": string, "backend": string },
  "why_this_is_unique": string,
  "simple_explanation": string,
  "explanation": string
}
ALWAYS use React for frontend and Node.js for backend. MUST include: innovation, intelligence layer, demo highlight, business value, ethical considerations, and user control.
Avoid generic CRUD-only systems. Focus on architecture FIRST, code SECOND. Code samples must be minimal but meaningful.
MUST include: simplified_prototype (how to demo easily), prototype_scope (what will actually be built), fallback_mode (if advanced system fails).
When explaining steps 1, 2, 3, and 5, use professional, concise, and technical language as if you are a lead architect explaining to a team.`
      }
    });

    let fullText = "";
    let currentStep = 0;
    let stepContent = "";
    let jsonData: SystemDesign | undefined;

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (!text) continue;
      
      fullText += text;

      // Identify steps
      const steps = [
        "Step 1: Understanding the idea",
        "Step 2: Identifying core components",
        "Step 3: Designing architecture",
        "Step 4: Generating system structure",
        "Step 5: Final explanation"
      ];

      for (let i = 0; i < steps.length; i++) {
        if (fullText.includes(steps[i]) && currentStep < i + 1) {
          // If we found a new step, yield the previous one as complete
          if (currentStep > 0) {
            yield {
              step: currentStep,
              label: steps[currentStep - 1],
              content: stepContent.trim(),
              isComplete: true,
              data: jsonData
            };
          }
          currentStep = i + 1;
          stepContent = "";
        }
      }

      if (currentStep > 0) {
        // Extract content for current step
        const nextStepLabel = steps[currentStep];
        let content = fullText.split(steps[currentStep - 1])[1] || "";
        if (nextStepLabel && content.includes(nextStepLabel)) {
          content = content.split(nextStepLabel)[0];
        }
        stepContent = content;

        // Special handling for Step 4 JSON
        if (currentStep === 4 || currentStep === 5) {
          // Try to find JSON in code blocks first (json or just ```)
          let jsonStr = "";
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonStr = jsonMatch[1];
          } else {
            // Fallback: try to find anything that looks like a JSON object
            // We look in the whole fullText to be safe if it was split across steps
            const firstBrace = fullText.indexOf('{');
            const lastBrace = fullText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              jsonStr = fullText.substring(firstBrace, lastBrace + 1);
            }
          }

          if (jsonStr) {
            try {
              // Basic cleanup for common LLM JSON mistakes
              const cleanedJson = jsonStr.trim();
              jsonData = JSON.parse(cleanedJson);
            } catch (e) {
              // JSON might be incomplete or invalid yet
            }
          }
        }

        yield {
          step: currentStep,
          label: steps[currentStep - 1],
          content: stepContent.trim(),
          isComplete: false,
          data: jsonData
        };
      }
    }

    // Final yield for the last step
    if (currentStep > 0) {
      const steps = [
        "Step 1: Understanding the idea",
        "Step 2: Identifying core components",
        "Step 3: Designing architecture",
        "Step 4: Generating system structure",
        "Step 5: Final explanation"
      ];
      yield {
        step: currentStep,
        label: steps[currentStep - 1],
        content: stepContent.trim(),
        isComplete: true,
        data: jsonData
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

// Keep the old function for compatibility or internal use if needed, 
// but we'll primarily use the stream one now.
export async function generateSystemDesign(prompt: string): Promise<SystemDesign> {
  const gen = generateSystemDesignStream(prompt);
  let lastData: SystemDesign | undefined;
  for await (const step of gen) {
    if (step.data) lastData = step.data;
  }
  if (!lastData) throw new Error("Failed to generate system design data");
  return lastData;
}
