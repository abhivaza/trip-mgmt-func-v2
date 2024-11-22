import { NextFunction, Router } from "express";
import { verifyToken } from "../middleware/auth";

import {
  generateItinerary,
  getAllItineraries,
  getItineraryById,
} from "../controller/itinerary-controller";
import {
  getAllChatResponse,
  getTripChatResponse,
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
  getTripChatResponse
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
  getAllChatResponse
);

export default protectedRouter;
