import { z } from "zod";
import { ItineraryDay } from "./itinerary-day.types";

export const itineraryDaySchema = z.object({
  dayNumber: z.number().describe("The day number in the itinerary."),
  place: z.string().describe("The name of the place visiting for the day."),
  title: z.string().describe("The title of the day's activities."),
  description: z.string().describe(
    `The recommended things to do around or at the given place during 
      the day in markdown format.`
  ),
}) satisfies z.ZodType<Omit<ItineraryDay, "thingsToDo">>;

export const tripDayItineraryGenerationInputSchema = z.object({
  place: z.string().describe("The name of the city."),
  content: z.string().describe("The itinerary of the trip."),
  specialInstructions: z
    .string()
    .optional()
    .describe("The special request of the user."),
});
