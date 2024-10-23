import * as z from "zod";

import { generate } from "@genkit-ai/ai";
import { configureGenkit } from "@genkit-ai/core";
import { firebase } from "@genkit-ai/firebase";
import { gemini15Flash, googleAI } from "@genkit-ai/googleai";

import { defineFlow } from "@genkit-ai/flow";

configureGenkit({
  plugins: [
    firebase(),
    // Load the Google AI plugin. You can optionally specify your API key
    // by passing in a config object; if you don't, the Google AI plugin uses
    // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
    // the recommended practice.
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
  ],
  // Log debug output to tbe console.
  logLevel: "debug",
  // Perform OpenTelemetry instrumentation and enable trace collection.
  enableTracingAndMetrics: true,
});

const tripSchema = z.object({
  message: z.string().describe("SUCCESS if city is found, otherwise FAILURE"),
  itinerary: z.array(
    z.object({
      day: z.number().describe("The day number in the itinerary."),
      title: z.string().describe("The title of the day's activities."),
      description: z
        .string()
        .describe("A brief description of the day's overall plan."),
      activities: z.object({
        morning: z
          .array(z.string())
          .describe("Activities scheduled for the morning."),
        afternoon: z
          .array(z.string())
          .describe("Activities scheduled for the afternoon."),
        evening: z
          .array(z.string())
          .describe("Activities scheduled for the evening."),
      }),
    })
  ),
});

export const tripGenerationFlow = defineFlow(
  {
    name: "tripGenerationFlow",
    inputSchema: z.string(),
  },
  async (subject) => {
    // Construct a request and send it to the model API.
    const prompt = `Must give itinerary for valid city only, othwerise return FAILURE in message field. Create a day by day itinerary for ${subject} city.`;
    console.log(prompt);
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      output: { schema: tripSchema },
      config: {
        temperature: 1,
      },
    });

    return llmResponse.output();
  }
);
