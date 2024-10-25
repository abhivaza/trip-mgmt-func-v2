import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getFirebaseConfig } from "./config";
import app from "./app";

functions.onInit(() => {
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
});

export const api = functions.https.onRequest(app);
