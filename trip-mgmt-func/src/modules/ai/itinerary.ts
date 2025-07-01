import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { defineFlow } from "@genkit-ai/flow";
import { z } from "zod";
import { genkit } from "genkit";

import {
  ItineraryDocument,
  tripGenerationInputSchema,
  tripGenerationOutputSchema,
  tripReGenerationInputSchema,
} from "@/types/imported";
import {
  ThingToDo,
  tripSectionGenerationInputSchema,
  tripSectionGenerationOutputSchema,
} from "@/types/imported";
import {
  itineraryDaySchema,
  ItineraryDay,
  tripDayItineraryGenerationInputSchema,
} from "@/types/imported";
import {
  activitySchema,
  Activity,
  tripSectionActivityGenerationInputSchema,
} from "@/types/imported";

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
      Query from user: ${subject.userQuery}.
      `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: { format: "json", schema: tripGenerationOutputSchema },
      config: {
        temperature: 1,
      },
    });

    return llmResponse.output as ItineraryDocument;
  }
);

export const tripReGenerationFlow = defineFlow(
  {
    name: "tripReGenerationFlow",
    inputSchema: tripReGenerationInputSchema,
    outputSchema: tripGenerationOutputSchema,
  },
  async (subject) => {
    const prompt = `Output is in JSON format, do not use double quotes in JSON field value.
      You are acting as travel advisor. 
      You must regenerate itinerary for given city as per the user instruction given and existing itinerary.
      City: ${subject.city}.
      Existing itinerary: ${subject.content}.
      Special request from user: ${subject.specialInstructions}.
      `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: { format: "json", schema: tripGenerationOutputSchema },
      config: {
        temperature: 1,
      },
    });

    return llmResponse.output as ItineraryDocument;
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
      Special request: ${subject.specialInstructions || "None"}.
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

    return llmResponse.output as ItineraryDay;
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
      Accommodate special request given if any.
      Place visiting during the day: ${subject.place},
      Activity requested: ${subject.activity},
      Special request: ${subject.specialInstructions || "None"}.
      `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: { format: "json", schema: tripSectionGenerationOutputSchema },
      config: {
        temperature: 1,
      },
    });

    return llmResponse.output as ThingToDo;
  }
);

export const tripSectionActivityGenerationFlow = defineFlow(
  {
    name: "tripSectionActivityGenerationFlow",
    inputSchema: tripSectionActivityGenerationInputSchema,
    outputSchema: activitySchema,
  },
  async (subject) => {
    const prompt = `Output is in JSON format, do not use double quotes in JSON field value.
      You are acting as travel advisor.
      Create a plan for asked activity at given place.
      Generate exactly 1 option in output schema.
      Accommodate special request given if any.
      Place visiting during the day: ${subject.place},
      Activity requested: ${subject.activity},
      Current activity content: ${subject.content},
      Special request: ${subject.specialInstructions || "None"}.
      `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: { format: "json", schema: activitySchema },
      config: {
        temperature: 1,
      },
    });

    return llmResponse.output as Activity;
  }
);

export const tripChatFlow = defineFlow(
  {
    name: "tripChatFlow",
    inputSchema: z.object({
      question: z.string().describe("the search text"),
      tripDetails: z.string().describe("the trip information"),
    }),
    outputSchema: z.string().describe("the search result in markdown format"),
  },
  async (subject) => {
    // Construct a request and send it to the model API.
    const prompt = `You are acting as travel advisor.
      Use the following pieces of trip information to customize your answer if possible,
      otherwise answer based on your knowledge.
      Limit your answers to maximum 3 sentences.
      Trip Information: ${subject.tripDetails}.
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
