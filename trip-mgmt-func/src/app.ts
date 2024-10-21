import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import protectedRouter from "./routes/protected";
import publicRouter from "./routes/public";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: ["http://localhost:3000", "https://yourdomain.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", protectedRouter); // Auth routes under /api/auth
app.use("/", publicRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred",
  });
});

export default app;
