import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import app from "./app";
import { configureGenkit } from "@genkit-ai/core";
import { firebase } from "@genkit-ai/firebase";
import { googleAI } from "@genkit-ai/googleai";
import { getFirebaseConfig } from "./config";
import { vertexAI } from "@genkit-ai/vertexai";

functions.onInit(() => {
  // initialize firebase
  admin.initializeApp({
    credential: admin.credential.cert(
      getFirebaseConfig().serviceAccount as admin.ServiceAccount
    ),
    storageBucket: "trip-mgmt-751d8",
  });

  // Uncomment for running local DB
  // admin.initializeApp();
  // const firestore = admin.firestore();
  // firestore.settings({
  //   host: "localhost:8080", // Default emulator port
  //   ssl: false,
  // });

  // initialize genkit
  configureGenkit({
    plugins: [
      firebase(),
      googleAI({ apiKey: getFirebaseConfig().genAIConfig.googleAIApiKey }),
      vertexAI({
        projectId: getFirebaseConfig().serviceAccount.project_id,
        location: "us-central1",
      }),
    ],
    logLevel: "debug",
    enableTracingAndMetrics: true,
  });
});

export const api = functions.runWith({ memory: "512MB" }).https.onRequest(app);
