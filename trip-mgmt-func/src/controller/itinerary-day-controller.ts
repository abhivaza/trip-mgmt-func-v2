import { Response } from "express";
import { getDBItinerary } from "../modules/database/itinerary";
import { runFlow } from "@genkit-ai/flow";
import { tripDayItineraryGenerationFlow } from "../modules/ai/itinerary";
import { AuthenticatedRequest } from "../types/common";

export const generateItineraryDay = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { place, specialInstructions } = req.body;
  const document = await getDBItinerary(req.params.trip_id);
  if (document) {
    const response = await runFlow(tripDayItineraryGenerationFlow, {
      place: place,
      content: JSON.stringify(document.itineraryDays),
      specialInstructions: specialInstructions,
    });
    res.send(response);
  }
};
