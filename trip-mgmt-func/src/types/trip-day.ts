import { z } from "zod";

export const itinerarySchema = z.object({
  dayNumber: z.number().describe("The day number in the itinerary."),
  date: z.date().describe("The date of the day."),
  place: z.string().describe("The name of the place visiting for the day."),
  title: z.string().describe("The title of the day's activities."),
  shortDescription: z
    .string()
    .describe("A brief description of the day's overall plan."),
  description: z.string().describe(
    `The recommended things to do around or at the given place during 
      the day in markdown format.`
  ),
});

export const tripDayItineraryGenerationInputSchema = z.object({
  place: z.string().describe("The name of the city."),
  content: z.string().describe("The itinerary of the trip."),
  specialRequest: z
    .string()
    .optional()
    .describe("The special request of the user."),
});

export type TripDayItineraryDocument = z.infer<typeof itinerarySchema>;
