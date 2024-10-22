import { NextFunction, Router } from "express";
import * as functions from "firebase-functions";

import { verifyToken } from "../middleware/auth";
import { AuthenticatedRequest } from "../type";

import { runFlow } from "@genkit-ai/flow";
import { menuSuggestionFlow } from "../modules/generate";

const protectedRouter = Router();

protectedRouter.get(
  "/protected",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  (req: AuthenticatedRequest, res, next: NextFunction) => {
    const body = req.body;
    functions.logger.info("Echoing request body", body);
    res.json({
      message: "Echo from Firebase and Express!",
      body: {
        id: "test",
      },
    });
  }
);

protectedRouter.get(
  "/generate",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  async (req, res) => {
    const response = await runFlow(menuSuggestionFlow, "New York");
    res.send("Generate response!" + JSON.stringify(response));
  }
);

export default protectedRouter;
