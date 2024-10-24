import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import app from "./app";
import { defineString } from "firebase-functions/params";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // Your service account credentials
      projectId: defineString("FIREBASE_PROJECT_ID").value(),
      clientEmail: defineString("FIREBASE_CLIENT_EMAIL").value(),
      privateKey: defineString("FIREBASE_PRIVATE_KEY").value(),
    }),
  });
}

export const api = functions.https.onRequest(app);
