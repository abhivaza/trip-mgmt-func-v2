import { Response } from "express";
import { getDBItinerary } from "../modules/database/itinerary";
import { runFlow } from "@genkit-ai/flow";
import { tripSectionActivityGenerationFlow } from "../modules/ai/itinerary";
import { AuthenticatedRequest } from "../types/common";

export const generateItinerarySectionActivity = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { place, activity, specialInstructions } = req.body;
  const document = await getDBItinerary(req.params.trip_id);
  if (document) {
    const response = await runFlow(tripSectionActivityGenerationFlow, {
      activity,
      place,
      content: JSON.stringify(document.itinerary),
      specialInstructions: specialInstructions,
    });
    res.send(response);
  }
};
