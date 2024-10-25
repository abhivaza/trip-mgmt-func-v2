import { NextFunction, Router } from "express";
import { verifyToken } from "../middleware/auth";
import { AuthenticatedRequest } from "../type";

import { runFlow } from "@genkit-ai/flow";
import { tripGenerationFlow } from "../modules/generate";
import { getStoredItinerary } from "../modules/database";

const protectedRouter = Router();

protectedRouter.get(
  "/:trip_id",
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
  "/generate",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  async (req: AuthenticatedRequest, res) => {
    const { destination } = req.body;
    const response = await runFlow(tripGenerationFlow, {
      city: destination,
      userId: req.user?.uid || "",
    });
    res.send(response);
  }
);

export default protectedRouter;
