import { NextFunction, Router } from "express";
import { verifyToken } from "../middleware/auth";
import { AuthenticatedRequest } from "../type";

import { runFlow } from "@genkit-ai/flow";
import {
  tripGenerationFlow,
  tripImageGenerationFlow,
  tripSearchFlow,
} from "../modules/generate";
import {
  getChatContext,
  getStoredItinerary,
  getUserItineraries,
  storeLLMResponse,
} from "../modules/database";

const protectedRouter = Router();

protectedRouter.get(
  "/trip/:trip_id",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  (req: AuthenticatedRequest, res, next: NextFunction) => {
    const documentId = req.params.trip_id;
    getStoredItinerary(documentId)
      .then((itinerary) => {
        res.send(itinerary);
      })
      .catch((error) => {
        console.error("Error retrieving itinerary:", error);
        next(error);
      });
  }
);

protectedRouter.post(
  "/trip/:trip_id/chat",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  async (req: AuthenticatedRequest, res) => {
    const { question } = req.body;
    const document = await getStoredItinerary(req.params.trip_id);
    if (document) {
      const context = JSON.stringify(document);
      const response = await runFlow(tripSearchFlow, { question, context });
      res.send({ answer: response });
    }
  }
);

protectedRouter.post(
  "/trip/generate",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  async (req: AuthenticatedRequest, res) => {
    const { destination } = req.body;
    const response = await runFlow(tripGenerationFlow, {
      city: destination,
    });

    // const imageURL = await runFlow(tripImageGenerationFlow, response.city);
    const imageURL =
      "https://storage.googleapis.com/trip-mgmt-751d8.appspot.com/new-york.png";
    if (response?.message !== "FAILURE") {
      // Store the response in Firestore
      const documentId = await storeLLMResponse(
        { ...response, imageURL: imageURL },
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
  }
);

protectedRouter.get(
  "/trips",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    getUserItineraries(req.user?.uid || "")
      .then((itinerary) => {
        res.send(itinerary);
      })
      .catch((error) => {
        console.error("Error retrieving itinerary:", error);
        next(error);
      });
  }
);

protectedRouter.post(
  "/trips/chat",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  async (req: AuthenticatedRequest, res) => {
    const { question } = req.body;
    const context = await getChatContext(question);
    const response = await runFlow(tripSearchFlow, { question, context });
    res.send({ answer: response });
  }
);

export default protectedRouter;
