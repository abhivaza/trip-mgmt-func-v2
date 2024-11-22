import { runFlow } from "@genkit-ai/flow";
import {
  getChatContext,
  getStoredItinerary,
} from "../modules/database/itinerary";
import { tripSearchFlow } from "../modules/ai/itinerary";
import { Response } from "express";
import { AuthenticatedRequest } from "../models/common";

export const getTripChatResponse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { question } = req.body;
  const document = await getStoredItinerary(req.params.trip_id);
  if (document) {
    const context = JSON.stringify(document);
    const response = await runFlow(tripSearchFlow, { question, context });
    res.send({ answer: response });
  }
};

export const getAllChatResponse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { question } = req.body;
  const context = await getChatContext(question);
  const response = await runFlow(tripSearchFlow, { question, context });
  res.send({ answer: response });
};
