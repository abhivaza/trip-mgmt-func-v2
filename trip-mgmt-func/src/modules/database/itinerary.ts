import * as admin from "firebase-admin";
import { ItineraryDocument } from "../../types/imported";
import { gemini20Flash, googleAI, textEmbedding004 } from "@genkit-ai/googleai";
import { Document } from "@genkit-ai/ai/retriever";
import { genkit } from "genkit";
import { defineFirestoreRetriever } from "@genkit-ai/firebase";
import { FieldValue, Filter } from "firebase-admin/firestore";
import { getDBUser, signupUser } from "./users";

const collectionName = "trip-itineraries";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

export const createDBItinerary = async (
  tripDocument: ItineraryDocument,
  email?: string
) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection(collectionName).doc();
    const lowerCaseEmail = email?.toLocaleLowerCase();

    const embedding = (
      await ai.embed({
        embedder: textEmbedding004,
        content: Document.fromText(JSON.stringify(tripDocument.itineraryDays)),
      })
    )[0].embedding;

    await docRef.set({
      ...tripDocument,
      timestamp: new Date(),
      createdBy: lowerCaseEmail || null,
      embedding: FieldValue.vector(embedding),
      itineraryText: JSON.stringify(tripDocument.itineraryDays),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error storing LLM response:", error);
    throw error;
  }
};

export const updateDBItinerary = async (
  docId: string,
  tripDocument: Partial<ItineraryDocument>,
  userId?: string
) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection(collectionName).doc(docId);

    // Get any new embedding if the itinerary was updated
    let embeddingUpdate = {};
    if (tripDocument.itineraryDays) {
      const embedding = (
        await ai.embed({
          embedder: textEmbedding004,
          content: Document.fromText(
            JSON.stringify(tripDocument.itineraryDays)
          ),
        })
      )[0].embedding;

      embeddingUpdate = {
        embedding: FieldValue.vector(embedding),
        itineraryText: JSON.stringify(tripDocument.itineraryDays),
      };
    }

    await docRef.update({
      ...tripDocument,
      lastUpdated: new Date(),
      updatedBy: userId || null,
      ...embeddingUpdate,
    });

    return docId;
  } catch (error) {
    console.error("Error updating itinerary data:", error);
    throw error;
  }
};

export const deleteDBItinerary = async (docId: string) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection(collectionName).doc(docId);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error(`Document with ID ${docId} does not exist`);
    }

    await docRef.delete();

    return docId;
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    throw error;
  }
};

export const getDBItinerary = async (
  documentId: string
): Promise<ItineraryDocument | null> => {
  try {
    const db = admin.firestore();
    const doc = await db.collection(collectionName).doc(documentId).get();
    if (!doc.exists) {
      throw new Error("Itinerary not found");
    }
    return (doc.data() as ItineraryDocument) || null;
  } catch (error) {
    console.error("Error retrieving itinerary:", error);
    throw error;
  }
};

export const shareDBItinerary = async (
  documentId: string,
  email: string
): Promise<void> => {
  try {
    const db = admin.firestore();
    const docRef = db.collection(collectionName).doc(documentId);
    const lowerCaseEmail = email.toLocaleLowerCase();

    await docRef.update({
      sharedWith: FieldValue.arrayUnion(lowerCaseEmail),
    });

    const user = await getDBUser(lowerCaseEmail);
    if (!user) {
      await signupUser(lowerCaseEmail);
    }

    return;
  } catch (error) {
    console.error("Error sharing itinerary:", error);
    throw error;
  }
};

export const deleteShareDBItinerary = async (
  documentId: string,
  email: string
): Promise<void> => {
  try {
    const db = admin.firestore();
    const docRef = db.collection(collectionName).doc(documentId);
    const lowerCaseEmail = email.toLocaleLowerCase();

    await docRef.update({
      sharedWith: FieldValue.arrayRemove(lowerCaseEmail),
    });

    return;
  } catch (error) {
    console.error("Error deleting person from shared itinerary:", error);
    throw error;
  }
};

export const getDBItinerariesByCity = async (
  city: string
): Promise<Array<ItineraryDocument & { id: string }>> => {
  try {
    const db = admin.firestore();
    const snapshot = await db
      .collection(collectionName)
      .where("city", "==", city)
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as ItineraryDocument),
    }));
  } catch (error) {
    console.error("Error querying itineraries:", error);
    throw error;
  }
};

export const getDBItinerariesForUser = async (
  email: string
): Promise<Array<ItineraryDocument & { id: string }>> => {
  try {
    const db = admin.firestore();
    const lowerCaseEmail = email.toLocaleLowerCase();

    const snapshot = await db
      .collection(collectionName)
      .where(
        Filter.or(
          Filter.where("createdBy", "==", lowerCaseEmail),
          Filter.where("sharedWith", "array-contains", lowerCaseEmail)
        )
      )
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as ItineraryDocument),
    }));
  } catch (error) {
    console.error("Error retrieving user itineraries:", error);
    throw error;
  }
};

export const getItineraryRetriever = () => {
  return defineFirestoreRetriever(ai, {
    name: "trip-summary",
    firestore: admin.firestore(),
    collection: collectionName,
    contentField: "itineraryText",
    vectorField: "embedding",
    embedder: textEmbedding004,
    distanceMeasure: "COSINE",
  });
};

export const getDBChatContext = async (subject: string): Promise<string> => {
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

export const getDBPublicItineraries = async (): Promise<
  Array<ItineraryDocument & { id: string }>
> => {
  try {
    const db = admin.firestore();
    const snapshot = await db
      .collection(collectionName)
      .where("isPublic", "==", true)
      .orderBy("timestamp", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as ItineraryDocument),
    }));
  } catch (error) {
    console.error("Error retrieving user itineraries:", error);
    throw error;
  }
};
