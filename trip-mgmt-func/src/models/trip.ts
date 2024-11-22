import { z } from "zod";

export const tripGenerationInputSchema = z.object({
  city: z.string().describe("The name of the city."),
});

export const tripGenerationOutputSchema = z.object({
  message: z.string().describe("SUCCESS if city is found, otherwise FAILURE"),
  city: z.string().describe("The name of the city."),
  country: z.string().describe("The name of the country."),
  popularityRank: z
    .number()
    .describe("The city's popularity rank among tourists in the country."),
  tags: z
    .array(z.string())
    .describe("The trip's tags which can be used to filter results."),
  itinerary: z.array(
    z.object({
      day: z.number().describe("The day number in the itinerary."),
      title: z.string().describe("The title of the day's activities."),
      description: z
        .string()
        .describe("A brief description of the day's overall plan."),
      activities: z
        .array(z.string())
        .describe(
          "Recommended things to do around or at the given city during the day."
        ),
    })
  ),
  imageURL: z.string().describe("empty field."),
});

export type TripDocument = z.infer<typeof tripGenerationOutputSchema>;
