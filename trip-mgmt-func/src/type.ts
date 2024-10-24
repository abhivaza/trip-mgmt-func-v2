import { Request } from "express";
import * as admin from "firebase-admin";
import { z } from "zod";

interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export type { AuthenticatedRequest };

export const tripGenerationInputSchema = z.object({
  cityName: z.string().describe("The name of the city."),
  userId: z.string().describe("The email of the user."),
});

export const tripOutputSchema = z.object({
  message: z.string().describe("SUCCESS if city is found, otherwise FAILURE"),
  cityName: z.string().describe("The name of the city."),
  countryName: z.string().describe("The name of the country."),
  popularityRank: z
    .number()
    .describe("The city's popularity rank among tourists in the country."),
  tags: z
    .array(z.string())
    .describe("The trip's tags which can be used to filter results."),
  itinerary: z.array(
    z.object({
      day: z.number().describe("The day number in the itinerary."),
      title: z.string().describe("The title of the day's activities."),
      description: z
        .string()
        .describe("A brief description of the day's overall plan."),
      activities: z.object({
        morning: z
          .array(z.string())
          .describe("Activities scheduled for the morning."),
        afternoon: z
          .array(z.string())
          .describe("Activities scheduled for the afternoon."),
        evening: z
          .array(z.string())
          .describe("Activities scheduled for the evening."),
      }),
    })
  ),
});

export type TripDocument = z.infer<typeof tripOutputSchema>;
