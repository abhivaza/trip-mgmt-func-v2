import { z } from "zod";

const ActivitySchema = z.object({
  name: z.string().describe("The short name of the activity."),
  description: z.string().describe(
    `The description of the activity including suggested time,
       duration, parking, location and other points in markdown format.`
  ),
});

const tripSectionGenerationOutputSchema = z.object({
  sectionHeader: z.string().describe("The title of the section."),
  activities: z.array(ActivitySchema).describe("The list of things to do."),
});

export type TripSectionDocument = z.infer<
  typeof tripSectionGenerationOutputSchema
>;
export default tripSectionGenerationOutputSchema;

export const tripSectionGenerationInputSchema = z.object({
  city: z.string().describe("The name of the city."),
  content: z.string().describe("The itinerary of the trip."),
  activity: z.string().describe("Thing to do during the given trip."),
});
