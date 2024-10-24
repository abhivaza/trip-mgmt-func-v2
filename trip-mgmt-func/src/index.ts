import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { defineString } from "firebase-functions/params";

admin.initializeApp({
  credential: admin.credential.cert({
    // Your service account credentials
    projectId: defineString("APP_FIREBASE_PROJECT_ID").value(),
    clientEmail: defineString("APP_FIREBASE_CLIENT_EMAIL").value(),
    privateKey: defineString("APP_FIREBASE_PRIVATE_KEY").value(),
  }),
});

import app from "./app";
export const api = functions.https.onRequest(app);
