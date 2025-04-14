import { z } from "zod";

// Define location schema
const LocationSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  googleMapsUrl: z.string().url().optional(),
});

// Define activity schema
const ActivitySchema = z.object({
  name: z.string(),
  description: z.string(),
  duration: z
    .object({
      value: z.number(),
      unit: z.enum(["minutes", "hours", "days"]),
    })
    .optional(),
  cost: z
    .object({
      amount: z.number(),
      currency: z.string(),
    })
    .optional(),
  bestTimeToVisit: z.string().optional(),
  idealWeather: z
    .array(
      z.enum([
        "sunny",
        "partly_cloudy",
        "cloudy",
        "rainy",
        "snowy",
        "stormy",
        "windy",
        "foggy",
        "any",
      ])
    )
    .optional(),
  location: LocationSchema.optional(),
  imageUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  bookingUrl: z.string().url().optional(),
  contactInfo: z.string().optional(),
});

// Main Trip Section Schema
const tripSectionGenerationOutputSchema = z.object({
  sectionHeader: z.string(),
  sectionSubtitle: z.string().optional(),
  sectionContent: z.string(),
  destinationName: z.string(),
  activities: z.array(ActivitySchema),
  recommendedSeason: z
    .enum([
      "spring",
      "summer",
      "fall",
      "winter",
      "year_round",
      "dry_season",
      "wet_season",
    ])
    .optional(),
  localTips: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  transportationOptions: z.array(z.string()).optional(),
  accessibility: z
    .object({
      wheelchairAccessible: z.boolean(),
      familyFriendly: z.boolean(),
      petFriendly: z.boolean(),
      seniorFriendly: z.boolean(),
    })
    .optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
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
