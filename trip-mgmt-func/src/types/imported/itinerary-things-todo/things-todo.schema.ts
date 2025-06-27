import { z } from "zod";
import { activitySchema } from "../itinerary-activity";
import { ThingToDo } from "./things-todo.types";

export const tripSectionGenerationInputSchema = z.object({
  place: z.string().describe("The name of the city."),
  content: z.string().describe("The itinerary of the day for the trip."),
  activity: z.string().describe("Thing to do during the day."),
  specialInstructions: z
    .string()
    .optional()
    .describe("The special request of the user."),
});

export const tripSectionGenerationOutputSchema = z.object({
  title: z.string().describe("The title of the section."),
  activities: z
    .array(activitySchema)
    .describe("The list of things to do. Limit to maximum 3 activities."),
}) satisfies z.ZodType<Omit<ThingToDo, "id">>;
