import { Router } from "express";
import { verifyToken } from "../middleware/auth";

import {
  deleteItinerary,
  deleteShareItinerary,
  generateItinerary,
  getAllItineraries,
  getItinerary,
  reGenerateItinerary,
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
protectedRouter.post("/trip/:trip_id/regenerate", reGenerateItinerary);
protectedRouter.post("/trip/:trip_id/chat", getItineraryChatResponse);
protectedRouter.get("/trip/:trip_id", getItinerary);
protectedRouter.put("/trip/:trip_id", updateItinerary);
protectedRouter.delete("/trip/:trip_id", deleteItinerary);

// Trip share routes
protectedRouter.post("/trip/:trip_id/share", shareItinerary);
protectedRouter.delete("/trip/:trip_id/share/:email", deleteShareItinerary);

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
