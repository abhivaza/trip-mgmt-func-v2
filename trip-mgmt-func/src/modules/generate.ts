import { generate } from "@genkit-ai/ai";
import { gemini15Flash } from "@genkit-ai/googleai";

import { defineFlow } from "@genkit-ai/flow";
import {
  TripDocument,
  tripGenerationInputSchema,
  tripOutputSchema,
} from "../type";
import { storeLLMResponse } from "./database";

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
