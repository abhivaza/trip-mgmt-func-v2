import { NextFunction, Response } from "express";
import {
  getPublicItineraries,
  getStoredItinerary,
  getUserItineraries,
  storeItineraryData,
} from "../modules/database/itinerary";
import { runFlow } from "@genkit-ai/flow";
import { tripGenerationFlow } from "../modules/ai/itinerary";
// import { tripImageGenerationFlow } from "../modules/ai/image";
import { getImageContextDocument } from "../modules/database/image";
import { AuthenticatedRequest } from "../models/common";

export const getItineraryById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const documentId = req.params.trip_id;
  getStoredItinerary(documentId)
    .then((itinerary) => {
      res.send(itinerary);
    })
    .catch((error) => {
      console.error("Error retrieving itinerary:", error);
      next(error);
    });
};

export const generateItinerary = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { destination } = req.body;
  const response = await runFlow(tripGenerationFlow, {
    city: destination,
  });

  const imageURL = await getImageContextDocument(response.city);

  if (imageURL) {
    // runFlow(tripImageGenerationFlow, {
    //   city: response.city,
    //   tags: response.tags.join(", "),
    // });
  }

  if (response?.message !== "FAILURE") {
    // Store the response in Firestore
    const documentId = await storeItineraryData(
      { ...response, imageURL: imageURL ?? "" },
      req.user?.uid
    );
    // Add the Firestore document ID to the response
    res.send({
      ...response,
      id: documentId,
    });
  } else {
    res.send(response);
  }
};

export const getAllItineraries = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  getUserItineraries(req.user?.uid || "")
    .then((itinerary) => {
      res.send(itinerary);
    })
    .catch((error) => {
      console.error("Error retrieving itinerary:", error);
      next(error);
    });
};

export const getAllPublicItineraries = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  getPublicItineraries()
    .then((itinerary) => {
      res.send(itinerary);
    })
    .catch((error) => {
      console.error("Error retrieving itinerary:", error);
      next(error);
    });
};
