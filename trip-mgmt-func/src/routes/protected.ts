import { Router } from "express";
import { verifyToken } from "../middleware/auth";

import {
  deleteItinerary,
  generateItinerary,
  getAllItineraries,
  getItinerary,
  shareItinerary,
  updateItinerary,
} from "../controller/itinerary-controller";
import {
  getAllItineraryChatResponse,
  getItineraryChatResponse,
} from "../controller/chat-controller";
import { generateItinerarySection } from "../controller/itinerary-section-controller";
import { generateItineraryDay } from "../controller/itinerary-day-controller";
import { generateItinerarySectionActivity } from "../controller/itinerary-section-activity-controller";

const protectedRouter = Router();

// Middleware
protectedRouter.use(verifyToken);

// All trip routes
protectedRouter.get("/trips", getAllItineraries);
protectedRouter.post("/trips/chat", getAllItineraryChatResponse);

// Trip routes
protectedRouter.post("/trip/generate", generateItinerary);
protectedRouter.get("/trip/:trip_id", getItinerary);
protectedRouter.put("/trip/:trip_id", updateItinerary);
protectedRouter.delete("/trip/:trip_id", deleteItinerary);
protectedRouter.post("/trip/:trip_id/chat", getItineraryChatResponse);
protectedRouter.post("/trip/:trip_id/share", shareItinerary);

// Trip day routes
protectedRouter.post("/trip/:trip_id/day/generate", generateItineraryDay);

// Trip section routes
protectedRouter.post(
  "/trip/:trip_id/section/generate",
  generateItinerarySection
);

// Trip section activity routes
protectedRouter.post(
  "/trip/:trip_id/section/activity/generate",
  generateItinerarySectionActivity
);

export default protectedRouter;
