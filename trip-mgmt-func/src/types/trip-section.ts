import { z } from "zod";
import { activitySchema } from "./trip-section-activity";

export const tripSectionGenerationInputSchema = z.object({
  place: z.string().describe("The name of the city."),
  content: z.string().describe("The itinerary of the day for the trip."),
  activity: z.string().describe("Thing to do during the day."),
  specialRequest: z
    .string()
    .optional()
    .describe("The special request of the user."),
});

export const tripSectionGenerationOutputSchema = z.object({
  title: z.string().describe("The title of the section."),
  activities: z
    .array(activitySchema)
    .describe("The list of things to do. Limit to maximum 3 activities."),
});

export type TripSectionDocument = z.infer<
  typeof tripSectionGenerationOutputSchema
>;
