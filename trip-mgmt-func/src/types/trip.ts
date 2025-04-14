import { z } from "zod";

export const tripGenerationInputSchema = z.object({
  city: z.string().describe("The name of the city."),
});

export const tripGenerationOutputSchema = z.object({
  message: z.string().describe("SUCCESS if city is found, otherwise FAILURE"),
  city: z.string().describe("The name of the city."),
  fromDate: z.date().describe("Date one month from " + new Date()),
  tripDuration: z.number().describe("The duration of the trip in days."),
  country: z.string().describe("The name of the country."),
  popularityRank: z
    .number()
    .describe("The city's popularity rank among tourists in the country."),
  tags: z
    .array(z.string())
    .describe("The trip's tags which can be used to filter results."),
  itinerary: z.array(
    z.object({
      dayNumber: z.number().describe("The day number in the itinerary."),
      date: z.date().describe("The date of the day."),
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

export type TripDocument = z.infer<typeof tripGenerationOutputSchema> & {
  createdBy?: string;
  sharedWith?: string[];
};
