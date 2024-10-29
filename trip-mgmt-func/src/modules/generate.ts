import { generate, retrieve } from "@genkit-ai/ai";
import { gemini15Flash } from "@genkit-ai/googleai";

import { defineFlow } from "@genkit-ai/flow";
import {
  TripDocument,
  tripGenerationInputSchema,
  tripGenerationOutputSchema,
} from "../type";
import { getFirestoreRetriever, storeLLMResponse } from "./database";
import { z } from "zod";

export const tripGenerationFlow = defineFlow(
  {
    name: "tripGenerationFlow",
    inputSchema: tripGenerationInputSchema,
    outputSchema: tripGenerationOutputSchema,
  },
  async (subject) => {
    const prompt = `You are acting as travel advisor. You must generate itinerary for valid city only.
      If city is not valid, return FAILURE in message field of output JSON document.
      If city is valid, return SUCCESS in message field of output JSON document.
      Output is in JSON format, all JSON field values must be using single quotes instead of double quotes.
      Give all these instructions, create a day by day itinerary for ${subject.city} city.`;

    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      output: { format: "json", schema: tripGenerationOutputSchema },
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

export const tripSearchFlow = defineFlow(
  {
    name: "tripSearchFlow",
    inputSchema: z.string().describe("the search text"),
    outputSchema: z.string().describe("the search result"),
  },
  async (subject) => {
    const docs = await retrieve({
      retriever: getFirestoreRetriever(),
      query: subject,
      options: { limit: 5 },
    });

    const context = docs.map((doc) => doc.content[0].text).join("\n\n");

    // Construct a request and send it to the model API.
    const prompt = `Use the following pieces of context to answer queries at the end.
      If you dont know the answer, just say that you dont know and don't try to make up an answer.
      ${context}
      Query: ${subject}
      Helpful Answer:`;

    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    return llmResponse.text();
  }
);
