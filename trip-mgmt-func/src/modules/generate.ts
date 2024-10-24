import { generate } from "@genkit-ai/ai";
import { configureGenkit } from "@genkit-ai/core";
import { firebase } from "@genkit-ai/firebase";
import { gemini15Flash, googleAI } from "@genkit-ai/googleai";

import { defineFlow } from "@genkit-ai/flow";
import { defineString } from "firebase-functions/params";
import {
  TripDocument,
  tripGenerationInputSchema,
  tripOutputSchema,
} from "../type";
import { storeLLMResponse } from "./database";

configureGenkit({
  plugins: [
    firebase(),
    // Load the Google AI plugin. You can optionally specify your API key
    // by passing in a config object; if you don't, the Google AI plugin uses
    // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
    // the recommended practice.
    googleAI({ apiKey: defineString("APP_GOOGLE_GENAI_API_KEY").value() }),
  ],
  // Log debug output to tbe console.
  logLevel: "debug",
  // Perform OpenTelemetry instrumentation and enable trace collection.
  enableTracingAndMetrics: true,
});

export const tripGenerationFlow = defineFlow(
  {
    name: "tripGenerationFlow",
    inputSchema: tripGenerationInputSchema,
  },
  async (subject) => {
    // Construct a request and send it to the model API.
    const prompt = `Must give itinerary for valid city only, 
      othwerise return FAILURE in message field. 
      Create a day by day itinerary for ${subject.city} city.`;
    console.log(prompt);
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      output: { schema: tripOutputSchema },
      config: {
        temperature: 1,
      },
    });

    const response: TripDocument = llmResponse.output() as TripDocument;

    if (response?.message !== "FAILURE") {
      // Store the response in Firestore
      const documentId = await storeLLMResponse(response, subject.userId);
      // Add the Firestore document ID to the response
      return {
        ...response,
        tripId: documentId,
      };
    } else {
      return response;
    }
  }
);
