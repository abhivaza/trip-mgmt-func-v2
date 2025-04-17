import * as functionsV1 from "firebase-functions/v1";
import * as functionsV2 from "firebase-functions/v2";
import * as admin from "firebase-admin";
import restApiApp from "./app";
import { googleAI } from "@genkit-ai/googleai";
import { getFirebaseConfig } from "./config";
// import { vertexAI } from "@genkit-ai/vertexai";
import { createUser } from "./modules/users";
import { genkit } from "genkit";

functionsV2.onInit(() => {
  // initialize firebase
  // Comment for running local DB
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
  genkit({
    plugins: [
      googleAI(),
      // vertexAI({
      //   projectId: getFirebaseConfig().serviceAccount.project_id,
      //   location: "us-central1",
      // }),
    ],
  });
});

// api functions
export const api = functionsV2.https.onRequest(restApiApp);

// user management functions
export const userMgmt = functionsV1.auth.user().onCreate(createUser);
