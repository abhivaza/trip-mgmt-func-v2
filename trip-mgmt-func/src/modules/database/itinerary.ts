import * as admin from "firebase-admin";
import { TripDocument } from "../../models/trip";
import { gemini20Flash, googleAI, textEmbedding004 } from "@genkit-ai/googleai";
import { Document } from "@genkit-ai/ai/retriever";
import { genkit } from "genkit";
import { defineFirestoreRetriever } from "@genkit-ai/firebase";
import { FieldValue } from "firebase-admin/firestore";

const getDb = () => admin.firestore();

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

export const storeItineraryData = async (
  llmResponse: TripDocument,
  userId?: string
) => {
  try {
    const db = getDb();
    const docRef = db.collection("trip-itineraries").doc();

    const embedding = (
      await ai.embed({
        embedder: textEmbedding004,
        content: Document.fromText(JSON.stringify(llmResponse.itinerary)),
      })
    )[0].embedding;

    await docRef.set({
      ...llmResponse,
      timestamp: new Date(),
      createdBy: userId,
      embedding: FieldValue.vector(embedding),
      itineraryText: JSON.stringify(llmResponse.itinerary),
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
    const db = getDb();
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

export const queryItinerariesByCity = async (
  city: string
): Promise<Array<TripDocument & { id: string }>> => {
  try {
    const db = getDb();
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

export const getUserItineraries = async (
  userId: string
): Promise<Array<TripDocument & { id: string }>> => {
  try {
    const db = getDb();
    const snapshot = await db
      .collection("trip-itineraries")
      .where("createdBy", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TripDocument),
    }));
  } catch (error) {
    console.error("Error retrieving user itineraries:", error);
    throw error;
  }
};

export const getItineraryRetriever = () => {
  return defineFirestoreRetriever(ai, {
    name: "trip-summary",
    firestore: getDb(),
    collection: "trip-itineraries",
    contentField: "itineraryText",
    vectorField: "embedding",
    embedder: textEmbedding004,
    distanceMeasure: "COSINE",
  });
};

export const getChatContext = async (subject: string): Promise<string> => {
  try {
    const docs = await ai.retrieve({
      retriever: getItineraryRetriever(),
      query: subject,
      options: { limit: 3 },
    });

    const context = docs.map((doc) => doc.content[0].text).join("\n\n");
    return context;
  } catch (error) {
    console.error("Error retrieving user itineraries:", error);
    throw error;
  }
};

export const getPublicItineraries = async (): Promise<
  Array<TripDocument & { id: string }>
> => {
  try {
    const db = getDb();
    const snapshot = await db
      .collection("trip-itineraries")
      .where("isPublic", "==", true)
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TripDocument),
    }));
  } catch (error) {
    console.error("Error retrieving user itineraries:", error);
    throw error;
  }
};
