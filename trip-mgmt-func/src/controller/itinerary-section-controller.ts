import { Response } from "express";
import { getDBItinerary } from "../modules/database/itinerary";
import { runFlow } from "@genkit-ai/flow";
import { tripSectionGenerationFlow } from "../modules/ai/itinerary";
import { AuthenticatedRequest } from "../types/common";

export const generateItinerarySection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { place, activity, specialInstructions } = req.body;
  const document = await getDBItinerary(req.params.trip_id);
  if (document) {
    const response = await runFlow(tripSectionGenerationFlow, {
      activity,
      place,
      content: JSON.stringify(document.itinerary),
      specialInstructions: specialInstructions,
    });
    res.send(response);
  }
};
