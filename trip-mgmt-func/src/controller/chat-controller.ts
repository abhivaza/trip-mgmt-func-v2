import { runFlow } from "@genkit-ai/flow";
import { getDBChatContext, getDBItinerary } from "../modules/database/itinerary";
import { tripSearchFlow } from "../modules/ai/itinerary";
import { Response } from "express";
import { AuthenticatedRequest } from "../types/common";

export const getItineraryChatResponse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { question } = req.body;
  const document = await getDBItinerary(req.params.trip_id);
  if (document) {
    const context = JSON.stringify(document);
    const response = await runFlow(tripSearchFlow, { question, context });
    res.send({ answer: response });
  }
};

export const getAllItineraryChatResponse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { question } = req.body;
  const context = await getDBChatContext(question);
  const response = await runFlow(tripSearchFlow, { question, context });
  res.send({ answer: response });
};
