import { Request } from "express";
import * as admin from "firebase-admin";

interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export type { AuthenticatedRequest };
