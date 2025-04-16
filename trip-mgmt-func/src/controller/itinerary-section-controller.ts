import { NextFunction, Response } from "express";
import { getDBItinerary } from "../modules/database/itinerary";
import { runFlow } from "@genkit-ai/flow";
import { tripSectionGenerationFlow } from "../modules/ai/itinerary";
// import { tripImageGenerationFlow } from "../modules/ai/image";
import { AuthenticatedRequest } from "../types/common";

export const getItinerarySectionById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.trip_id;
  getDBItinerary(tripId)
    .then((itinerary) => {
      res.send(itinerary);
    })
    .catch((error) => {
      console.error("Error retrieving itinerary:", error);
      next(error);
    });
};

export const generateItinerarySection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { place, activity, specialRequest } = req.body;
  const document = await getDBItinerary(req.params.trip_id);
  if (document) {
    const response = await runFlow(tripSectionGenerationFlow, {
      activity,
      place,
      content: JSON.stringify(document.itinerary),
      specialRequest,
    });
    res.send(response);
  }
};

export const createItinerarySection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.trip_id;
  getDBItinerary(tripId)
    .then((itinerary) => {
      res.send(itinerary);
    })
    .catch((error) => {
      console.error("Error retrieving itinerary:", error);
      next(error);
    });
};

export const updateItinerarySection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.trip_id;
  getDBItinerary(tripId)
    .then((itinerary) => {
      res.send(itinerary);
    })
    .catch((error) => {
      console.error("Error retrieving itinerary:", error);
      next(error);
    });
};

export const deleteItinerarySection = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.trip_id;
  getDBItinerary(tripId)
    .then((itinerary) => {
      res.send(itinerary);
    })
    .catch((error) => {
      console.error("Error retrieving itinerary:", error);
      next(error);
    });
};
