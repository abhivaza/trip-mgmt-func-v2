import { defineDotprompt } from "@genkit-ai/dotprompt";
import { z } from "zod";
import { tripGenerationOutputSchema } from "../type";

export const tripGenerationPrompt = defineDotprompt(
  {
    name: "tripGenerationPrompt",
    model: "googleai/gemini-1.5-flash-latest",
    input: {
      schema: z.object({ name: z.string() }),
    },
    output: {
      format: "json",
      schema: tripGenerationOutputSchema,
    },
  },
  `Must give itinerary for valid city only.
      If city is not valid, return FAILURE in message field of output JSON document.
      If city is valid, return SUCCESS in message field of output JSON document.
      Give all these instructions, create a day by day itinerary for {{name}} city.`
);
