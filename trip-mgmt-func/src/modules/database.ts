import { TripDocument } from "../type";

import * as admin from "firebase-admin";

const db = admin.firestore();

export const storeLLMResponse = async (llmResponse: TripDocument) => {
  try {
    const docRef = db.collection("trip-itineraries").doc();
    await docRef.set({
      city: llmResponse.cityName,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      itinerary: llmResponse.itinerary,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error storing LLM response:", error);
    throw error;
  }
};

export const getStoredItinerary = async (
  documentId: string
): Promise<admin.firestore.DocumentData | null> => {
  try {
    const doc = await db.collection("trip-itineraries").doc(documentId).get();
    if (!doc.exists) {
      throw new Error("Itinerary not found");
    }
    return doc.data() || null;
  } catch (error) {
    console.error("Error retrieving itinerary:", error);
    throw error;
  }
};

// Function to query itineraries by city
export const queryItinerariesByCity = async (
  city: string
): Promise<Array<TripDocument & { id: string }>> => {
  try {
    const snapshot = await db
      .collection("trip-itineraries")
      .where("city", "==", city)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TripDocument),
    }));
  } catch (error) {
    console.error("Error querying itineraries:", error);
    throw error;
  }
};
