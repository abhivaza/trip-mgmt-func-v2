import { z } from "zod";
import { TripSectionDocument } from "./trip-section";
import { itineraryDaySchema } from "./trip-day";

export const tripGenerationInputSchema = z.object({
  city: z.string().describe("The name of the city."),
});

export const tripGenerationOutputSchema = z.object({
  message: z.string().describe("SUCCESS if city is found, otherwise FAILURE"),
  city: z.string().describe("The name of the city."),
  fromDate: z
    .date()
    .describe(
      "User specified trip start date. If not specified, default date is one month from today."
    ),
  tripDuration: z.number().describe("The duration of the trip in days."),
  country: z.string().describe("The name of the country."),
  popularityRank: z
    .number()
    .describe("The city's popularity rank among tourists in the country."),
  tags: z
    .array(z.string())
    .describe("The trip's tags which can be used to filter results."),
  itinerary: z.array(itineraryDaySchema).describe("The day by day itinerary."),
  imageURL: z.string().describe("empty field."),
});

export type TripDocument = z.infer<typeof tripGenerationOutputSchema> & {
  createdBy?: string;
  sharedWith?: string[];
  tripSections?: TripSectionDocument[];
};
