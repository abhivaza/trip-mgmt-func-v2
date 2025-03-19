import { NextFunction, Router } from "express";
import { verifyToken } from "../middleware/auth";

import {
  generateItinerary,
  getAllItineraries,
  getItineraryById,
  shareItinerary,
} from "../controller/itinerary-controller";
import {
  getAllItineraryChatResponse,
  getItineraryChatResponse,
} from "../controller/chat-controller";
import { AuthenticatedRequest } from "../models/common";

const protectedRouter = Router();

protectedRouter.get(
  "/trip/:trip_id",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  getItineraryById
);

protectedRouter.post(
  "/trip/:trip_id/chat",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  getItineraryChatResponse
);

protectedRouter.post(
  "/trip/:trip_id/share",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  shareItinerary
);

protectedRouter.post(
  "/trip/generate",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  generateItinerary
);

protectedRouter.get(
  "/trips",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  getAllItineraries
);

protectedRouter.post(
  "/trips/chat",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  getAllItineraryChatResponse
);

export default protectedRouter;
