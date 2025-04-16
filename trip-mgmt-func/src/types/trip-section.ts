import { z } from "zod";

export const activitySchema = z.object({
  title: z.string().describe("The short name of the activity."),
  description: z.string().describe(
    `The description of the activity including suggested time,
       duration, parking, location and other points in markdown format.`
  ),
});

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
  activities: z.array(activitySchema).describe("The list of things to do."),
});

export type TripSectionDocument = z.infer<
  typeof tripSectionGenerationOutputSchema
>;
