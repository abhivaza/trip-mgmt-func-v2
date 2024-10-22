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

// Define a simple flow that prompts an LLM to generate menu suggestions.
export const menuSuggestionFlow = defineFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    // Construct a request and send it to the model API.
    const prompt = `Create a day by day itinerary for ${subject} city.`;
    console.log(prompt);
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      output: {
        schema: z.array(
          z.object({
            dayNumber: z.string().describe("day number"),
            morning: z
              .string()
              .describe("acitivity can be done in morning time"),
            afternoon: z
              .string()
              .describe("acitivity can be done in afternoon time"),
            evening: z
              .string()
              .describe("acitivity can be done in evening time"),
            otherActivities: z
              .array(
                z.object({
                  name: z.string(),
                  duration: z.number(),
                })
              )
              .describe("acitivity name and duration in minutes"),
          })
        ),
      },
      config: {
        temperature: 1,
      },
    });

    // Handle the response from the model API. In this sample, we just
    // convert it to a string, but more complicated flows might coerce the
    // response into structured output or chain the response into another
    // LLM call, etc.

    console.log(llmResponse);

    return llmResponse.text();
  }
);
