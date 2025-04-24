import { NextFunction, Response } from "express";
import {
  getDBPublicItineraries,
  getDBItinerary,
  getDBItinerariesForUser,
  createDBItinerary,
  shareDBItinerary,
  updateDBItinerary,
  deleteDBItinerary,
} from "../modules/database/itinerary";
import { runFlow } from "@genkit-ai/flow";
import { tripGenerationFlow } from "../modules/ai/itinerary";
import { tripImageGenerationFlow } from "../modules/ai/image";
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
    updateDBItinerary(tripId, req.body, req.user?.email);
    return res.status(200).send({
      success: true,
      message: "Trip successfully updated",
    });
  } catch (error) {
    console.error("Error updating itinerary:", error);
    return next(error);
  }
};

export const deleteItinerary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.trip_id;

  try {
    deleteDBItinerary(tripId);
    return res.status(200).send({
      success: true,
      message: "Trip successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
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

  let imageURL = "";
  try {
    const random = Math.random();
    // Generate new image only for 10%
    if (random < 0.1) {
      imageURL = await runFlow(tripImageGenerationFlow, {
        city: response.city,
        tags: response.tags.join(", "),
      });
    }
  } catch (error) {
    console.error("Error retrieving image:", error);
  } finally {
    if (!imageURL) {
      imageURL = await getImageContextDocument(response.city);
    }
  }

  if (response?.message !== "FAILURE") {
    // Store the response in Firestore
    const documentId = await createDBItinerary(
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
  getDBPublicItineraries()
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
