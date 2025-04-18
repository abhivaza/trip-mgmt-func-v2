import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { defineFlow } from "@genkit-ai/flow";
import { z } from "zod";
import { genkit } from "genkit";

import {
  TripDocument,
  tripGenerationInputSchema,
  tripGenerationOutputSchema,
} from "../../types/trip";
import {
  TripSectionDocument,
  tripSectionGenerationInputSchema,
  tripSectionGenerationOutputSchema,
} from "../../types/trip-section";
import {
  itineraryDaySchema,
  TripDayItineraryDocument,
  tripDayItineraryGenerationInputSchema,
} from "../../types/trip-day";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

export const tripGenerationFlow = defineFlow(
  {
    name: "tripGenerationFlow",
    inputSchema: tripGenerationInputSchema,
    outputSchema: tripGenerationOutputSchema,
  },
  async (subject) => {
    const prompt = `Output is in JSON format, do not use double quotes in JSON field value.
      You are acting as travel advisor. 
      You must generate itinerary for valid city only.
      If city is not valid, return FAILURE in message field of output JSON document.
      If city is valid, return SUCCESS in message field of output JSON document.
      Give all these instructions, create a day by day itinerary for the city mentioned in the query.
      Query from user: ${subject.city}.
      `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: { format: "json", schema: tripGenerationOutputSchema },
      config: {
        temperature: 1,
      },
    });

    return llmResponse.output as TripDocument;
  }
);

export const tripDayItineraryGenerationFlow = defineFlow(
  {
    name: "tripDayItineraryGenerationFlow",
    inputSchema: tripDayItineraryGenerationInputSchema,
    outputSchema: itineraryDaySchema,
  },
  async (subject) => {
    const prompt = `Output is in JSON format, do not use double quotes in JSON field value.
      You are acting as travel advisor.
      Modify an itinerary for a day at given place as per the special request given.
      Accommodate special request given if any.
      Place visiting during the day: ${subject.place},
      Existing itinerary: ${subject.content},
      Special request: ${subject.specialRequest || "None"}.
      `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: {
        format: "json",
        schema: itineraryDaySchema,
      },
      config: {
        temperature: 1,
      },
    });

    return llmResponse.output as TripDayItineraryDocument;
  }
);

export const tripSectionGenerationFlow = defineFlow(
  {
    name: "tripSectionGenerationFlow",
    inputSchema: tripSectionGenerationInputSchema,
    outputSchema: tripSectionGenerationOutputSchema,
  },
  async (subject) => {
    const prompt = `Output is in JSON format, do not use double quotes in JSON field value.
      You are acting as travel advisor.
      Create a plan for asked activity at given place. 
      Give maximum 3 options in output schema.
      Accommodate special request given if any.
      Place visiting during the day: ${subject.place},
      Activity requested: ${subject.activity},
      Special request: ${subject.specialRequest || "None"}.
      `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: { format: "json", schema: tripSectionGenerationOutputSchema },
      config: {
        temperature: 1,
      },
    });

    return llmResponse.output as TripSectionDocument;
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
    const prompt = `You are acting as travel advisor.
      Use the following pieces of context only to answer queries at the end.
      If you don't know the answer, just say that you don't know and don't try to make up an answer.
      Limit your answers to maximum 3 sentences.
      Context: ${subject.context}.
      Query from user: ${subject.question}.
      `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    return llmResponse.text as string;
  }
);
