import { z } from "zod";
import { Activity } from "./activity.types";

export const activitySchema = z.object({
  title: z
    .string()
    .describe(
      "The short name of the activity. Do not include name of the place"
    ),
  description: z.string().describe(
    `The description of the activity including suggested time,
       duration, parking, location and other points in markdown format.`
  ),
}) satisfies z.ZodType<Omit<Activity, "id">>;

export const tripSectionActivityGenerationInputSchema = z.object({
  place: z.string().describe("The name of the city."),
  content: z.string().describe("The description of the things to do."),
  activity: z.string().describe("Thing to do during the day."),
  specialInstructions: z
    .string()
    .optional()
    .describe("The special request of the user."),
});
