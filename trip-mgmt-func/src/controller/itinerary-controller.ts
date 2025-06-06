import { NextFunction, Response } from "express";
import {
  getDBPublicItineraries,
  getDBItinerary,
  getDBItinerariesForUser,
  createDBItinerary,
  shareDBItinerary,
  updateDBItinerary,
  deleteDBItinerary,
  deleteShareDBItinerary,
} from "../modules/database/itinerary";
import { runFlow } from "@genkit-ai/flow";
import {
  tripGenerationFlow,
  tripReGenerationFlow,
} from "../modules/ai/itinerary";
import { tripImageGenerationFlow } from "../modules/ai/image";
import { getImageContextDocument } from "../modules/database/image";
import { AuthenticatedRequest } from "../types/common";

export const getItinerary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.trip_id;

  try {
    const tripData = await getDBItinerary(tripId);
    res.status(200).send({
      id: tripId,
      ...tripData,
    });
  } catch (error) {
    console.error("Error retrieving itinerary:", error);
    return next(error);
  }
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
    userQuery: destination,
  });

  let imageURL = "";
  try {
    const random = Math.random();
    // Generate new image only for 20%
    if (random <= 0.2) {
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

export const reGenerateItinerary = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { specialInstructions } = req.body;
  const tripId = req.params.trip_id;

  try {
    const document = await getDBItinerary(tripId);

    const response = await runFlow(tripReGenerationFlow, {
      city: document?.city || "",
      content: JSON.stringify(document?.itinerary),
      specialInstructions: specialInstructions,
    });

    const updatedDocument = {
      ...response,
      imageURL: document?.imageURL,
      fromDate: document?.fromDate,
      sharedWith: document?.sharedWith,
    };

    await updateDBItinerary(tripId, updatedDocument, req.user?.email);

    res.send(updatedDocument);
  } catch (error) {
    console.error("Error update itinerary:", error);
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
    if (
      itinerary?.createdBy?.toLocaleLowerCase() !==
      req.user?.email?.toLocaleLowerCase()
    ) {
      return res
        .status(403)
        .send({ error: "You don't have permission to share this itinerary." });
    }

    // Share the itinerary with the friend
    await shareDBItinerary(tripId, email);

    return res.status(200).send({
      success: true,
      message: `Itinerary successfully shared with ${email}`,
    });
  } catch (error) {
    console.error("Error sharing itinerary:", error);
    return next(error);
  }
};

export const deleteShareItinerary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tripId = req.params.trip_id;
  const email = req.params.email;

  if (!email) {
    return res.status(400).send({ error: "email is required" });
  }

  try {
    // First, verify the user has access to this trip
    const itinerary = await getDBItinerary(tripId);

    // Check if the current user owns this itinerary
    if (itinerary?.createdBy !== req.user?.email) {
      return res.status(403).send({
        error: "You don't have permission to remove person from itinerary.",
      });
    }

    // Share the itinerary with the friend
    await deleteShareDBItinerary(tripId, email);

    return res.status(200).send({
      success: true,
      message: `Itinerary successfully removed from ${email}`,
    });
  } catch (error) {
    console.error("Error deleting person from shared itinerary:", error);
    return next(error);
  }
};
