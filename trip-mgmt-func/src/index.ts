import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { defineString } from "firebase-functions/params";

// Get environment variables
const projectId = defineString("APP_FIREBASE_PROJECT_ID");
const clientEmail = defineString("APP_FIREBASE_CLIENT_EMAIL");
const privateKey = defineString("APP_FIREBASE_PRIVATE_KEY");

functions.onInit(() => {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId.value(),
      clientEmail: clientEmail.value(),
      privateKey: privateKey.value().replace(/\\n/g, "\n"),
    } as admin.ServiceAccount),
  });

  const firestore = admin.firestore();
  firestore.settings({
    host: "localhost:8080", // Default emulator port
    ssl: false,
  });
});

import app from "./app";
export const api = functions.https.onRequest(app);
