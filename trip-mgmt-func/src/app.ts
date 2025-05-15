import express, { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import protectedRouter from "./routes/protected";
import publicRouter from "./routes/public";
import { getAppConfig } from "./config";

const restApiApp = express();

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: getAppConfig().appConfig.corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Rate Limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 500, // Maximum requests per window
  message: "Too many requests, please try again after few minutes.",
});

// Middleware
restApiApp.use(cors(corsOptions));
restApiApp.use(limiter);
restApiApp.use(express.json());
restApiApp.use(express.urlencoded({ extended: true }));

// Routes
restApiApp.use("/app", protectedRouter); // Auth routes under /api/auth
restApiApp.use("/public", publicRouter);

restApiApp.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
    });
  }
);

export default restApiApp;
