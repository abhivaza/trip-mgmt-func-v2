import { Router } from "express";
import { getAllPublicItineraries } from "../controller/itinerary-controller";
const publicRouter = Router();

publicRouter.get("/trips", getAllPublicItineraries);

export default publicRouter;
