import { generate } from "@genkit-ai/ai";
import { gemini15Flash } from "@genkit-ai/googleai";
import { imagen2 } from "@genkit-ai/vertexai";
import parseDataURL from "data-urls";

import { defineFlow } from "@genkit-ai/flow";

import {
  TripDocument,
  tripGenerationInputSchema,
  tripGenerationOutputSchema,
} from "../type";
import { z } from "zod";
import { uploadImageBuffer } from "./storage";

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
      Output is in JSON format, do not use double quotes in JSON field value.
      Give all these instructions, create a day by day itinerary for the city mentioned in the query.
      Query: ${subject.city}.`;

    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      output: { format: "json", schema: tripGenerationOutputSchema },
      config: {
        temperature: 1,
      },
    });

    return llmResponse.output() as TripDocument;
  }
);

export const tripSearchFlow = defineFlow(
  {
    name: "tripSearchFlow",
    inputSchema: z.object({
      question: z.string().describe("the search text"),
      context: z.string().describe("the context"),
    }),
    outputSchema: z.string().describe("the search result"),
  },
  async (subject) => {
    // Construct a request and send it to the model API.
    const prompt = `Use the following pieces of context to answer queries at the end.
      If you dont know the answer, just say that you dont know and don't try to make up an answer.
      Limit your answers to maximum 3 sentences.
      ${subject.context}
      Query: ${subject.question}
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

export const tripImageGenerationFlow = defineFlow(
  {
    name: "tripImageGenerationFlow",
    inputSchema: z.string().describe("name of the city"),
  },
  async (city) => {
    // Construct a request and send it to the model API.
    const prompt = `A must-see iconic image for the city of ${city}.`;

    const mediaResponse = await generate({
      model: imagen2,
      prompt: prompt,
      output: { format: "media" },
    });
    const media = mediaResponse.media();
    if (!media) throw new Error("No media generated.");

    const data = parseDataURL(media.url);
    if (!data) throw new Error("Invalid data URL.");

    // Convert the parsed data URL to a Uint8Array or Blob for Firebase Storage
    const imageBytes = new Uint8Array(data.body); // Adjust if `data.body` format differs
    const fileName = `${city.toLowerCase().replace(/\s/g, "-")}.png`;

    return await uploadImageBuffer(imageBytes, fileName);
  }
);
