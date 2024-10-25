import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import app from "./app";
import { configureGenkit } from "@genkit-ai/core";
import { firebase } from "@genkit-ai/firebase";
import { googleAI } from "@genkit-ai/googleai";
import { getFirebaseConfig } from "./config";

functions.onInit(() => {
  // initialize firebase
  admin.initializeApp({
    credential: admin.credential.cert(
      getFirebaseConfig().serviceAccount as admin.ServiceAccount
    ),
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
      // Load the Google AI plugin. You can optionally specify your API key
      // by passing in a config object; if you don't, the Google AI plugin uses
      // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
      // the recommended practice.
      googleAI({ apiKey: getFirebaseConfig().appConfig.googleAIApiKey }),
    ],
    // Log debug output to tbe console.
    logLevel: "debug",
    // Perform OpenTelemetry instrumentation and enable trace collection.
    enableTracingAndMetrics: true,
  });
});

export const api = functions.https.onRequest(app);
