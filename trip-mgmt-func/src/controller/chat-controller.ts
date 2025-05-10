import { runFlow } from "@genkit-ai/flow";
import {
  getDBChatContext,
  getDBItinerary,
} from "../modules/database/itinerary";
import { tripChatFlow } from "../modules/ai/itinerary";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/common";

export const getItineraryChatResponse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question } = req.body;
    const document = await getDBItinerary(req.params.trip_id);
    if (document) {
      const context = JSON.stringify(document);
      const response = await runFlow(tripChatFlow, { question, tripDetails: context });
      res.send({ answer: response });
    }
  } catch (error) {
    console.error("Error retrieving itinerary:", error);
    return next(error);
  }
};

export const getAllItineraryChatResponse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question } = req.body;
    const context = await getDBChatContext(question);
    const response = await runFlow(tripChatFlow, { question, tripDetails: context });
    res.send({ answer: response });
  } catch (error) {
    console.error("Error retrieving itinerary:", error);
    return next(error);
  }
};
