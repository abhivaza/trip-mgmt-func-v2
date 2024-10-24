import { NextFunction, Router } from "express";
import * as functions from "firebase-functions";

import { verifyToken } from "../middleware/auth";
import { AuthenticatedRequest } from "../type";

import { runFlow } from "@genkit-ai/flow";
import { tripGenerationFlow } from "../modules/generate";

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

protectedRouter.post(
  "/generate",
  async (req: AuthenticatedRequest, res, next: NextFunction) => {
    await verifyToken(req, res, next);
  },
  async (req: AuthenticatedRequest, res) => {
    const { destination } = req.body;
    console.log(destination);
    const response = await runFlow(tripGenerationFlow, {
      cityName: destination,
      userId: req.user?.uid || "",
    });
    res.send(response);
  }
);

export default protectedRouter;
