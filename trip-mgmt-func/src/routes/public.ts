import { Router } from "express";
const publicRouter = Router();

publicRouter.get("/hello", (req, res) => {
  res.send("Hello from Firebase and Express!");
});

export default publicRouter;
