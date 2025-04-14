import { NextFunction, Response } from "express";
import * as admin from "firebase-admin";
import { AuthenticatedRequest } from "../types/common";

// Token extraction helper
const extractToken = (req: AuthenticatedRequest): string | null => {
  if (req.headers.authorization) {
    // Check Bearer token format
    const bearerMatch = req.headers.authorization.match(/^Bearer\s+(.*)$/i);
    if (bearerMatch) {
      return bearerMatch[1];
    }

    // If not in Bearer format, return the raw authorization header
    return req.headers.authorization;
  }

  // Check x-access-token header
  if (req.headers["x-access-token"]) {
    return req.headers["x-access-token"] as string;
  }

  // Check query parameter
  if (req.query && req.query.token) {
    return req.query.token as string;
  }

  // Check cookies if needed
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

// JWT verification middleware
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token using the helper function
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        message:
          "Please provide token in Authorization header, x-access-token header, or query parameter",
      });
    }

    try {
      // Verify the token using Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken) {
        return res.status(401).json({
          error: "Invalid token",
          message: "The provided token is invalid or has expired",
        });
      }

      // Attach the decoded token to the request object
      req.user = decodedToken;
      next();

      return;
    } catch (verificationError) {
      console.error("Token verification failed:", verificationError);
      return res.status(403).json({
        error: "Invalid token",
        message: "The provided token is invalid or has expired",
      });
    }
  } catch (error) {
    console.error("Token extraction failed:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Error processing authentication",
    });
  }
};
