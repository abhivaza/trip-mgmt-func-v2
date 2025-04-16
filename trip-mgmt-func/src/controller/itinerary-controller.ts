import { NextFunction, Response } from "express";
import {
  getPublicItineraries,
  getDBItinerary,
  getDBItinerariesForUser,
  setDBItineraryData,
  shareDBItinerary,
  updateDBItineraryData,
} from "../modules/database/itinerary";
import { runFlow } from "@genkit-ai/flow";
import { tripGenerationFlow } from "../modules/ai/itinerary";
// import { tripImageGenerationFlow } from "../modules/ai/image";
import { getImageContextDocument } from "../modules/database/image";
import { AuthenticatedRequest } from "../types/common";

export const getItinerary = async (
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

export const updateItinerary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.trip_id;

  try {
    updateDBItineraryData(tripId, req.body, req.user?.email);
    return res.status(200).send({
      success: true,
      message: "Trip successfully updated",
    });
  } catch (error) {
    console.error("Error updating itinerary:", error);
    return next(error);
  }
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
    const documentId = await setDBItineraryData(
      { ...response, imageURL: imageURL ?? "" },
      req.user?.email
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
  getDBItinerariesForUser(req.user?.email || "")
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

export const shareItinerary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.trip_id;
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ error: "email is required" });
  }

  try {
    // First, verify the user has access to this trip
    const itinerary = await getDBItinerary(tripId);

    // Check if the current user owns this itinerary
    if (itinerary?.createdBy !== req.user?.email) {
      return res
        .status(403)
        .send({ error: "You don't have permission to share this trip" });
    }

    // Share the itinerary with the friend
    await shareDBItinerary(tripId, email);

    return res.status(200).send({
      success: true,
      message: `Trip successfully shared with ${email}`,
    });
  } catch (error) {
    console.error("Error sharing itinerary:", error);
    return next(error);
  }
};
