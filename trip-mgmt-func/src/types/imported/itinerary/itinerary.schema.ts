import { z } from "zod";
import { getOneMonthFromNow } from "../common/utils";
import { ItineraryDocument } from "./itinerary.types";
import { itineraryDaySchema } from "../itinerary-day/itinerary-day.schema";

export const tripReGenerationInputSchema = z.object({
  city: z.string().describe("The name of the city."),
  content: z.string().describe("The itinerary of the trip."),
  specialInstructions: z
    .string()
    .optional()
    .describe("The special request of the user."),
});

export const tripGenerationInputSchema = z.object({
  userQuery: z.string().describe("The name of the city."),
});

export const tripGenerationOutputSchema = z.object({
  status: z.string().describe("SUCCESS if city is found, otherwise FAILURE"),
  city: z.string().describe("The name of the city."),
  fromDate: z.date().describe(
    `User specified trip start date. 
      If not specified, default start date if first Saturday of after ${getOneMonthFromNow()}.`
  ),
  tripDuration: z.number().describe("The duration of the trip in days."),
  country: z.string().describe("The name of the country."),
  popularityRank: z
    .number()
    .describe("The city's popularity rank among tourists in the country."),
  tags: z
    .array(z.string())
    .describe("The trip's tags which can be used to filter results."),
  itineraryDays: z
    .array(itineraryDaySchema)
    .describe("The day by day itinerary."),
}) satisfies z.ZodType<
  Omit<ItineraryDocument, "id" | "createdBy" | "sharedWith" | "imageURL">
>;
