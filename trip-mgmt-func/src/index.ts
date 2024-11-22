import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import restApiApp from "./app";
import { configureGenkit } from "@genkit-ai/core";
import { firebase } from "@genkit-ai/firebase";
import { googleAI } from "@genkit-ai/googleai";
import { getFirebaseConfig } from "./config";
import { vertexAI } from "@genkit-ai/vertexai";
import { createUser } from "./modules/users";

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

// api functions
export const api = functions
  .runWith({ memory: "512MB" })
  .https.onRequest(restApiApp);

// user managemnt functions
export const userMgmt = functions
  .runWith({ memory: "512MB" })
  .auth.user()
  .onCreate(createUser);
