import { embed } from "@genkit-ai/ai/embedder";
import { ImageDocument } from "../../models/image";
import * as admin from "firebase-admin";
import { textEmbeddingGecko001 } from "@genkit-ai/googleai";
import { Document, retrieve } from "@genkit-ai/ai/retriever";
import { FieldValue } from "firebase-admin/firestore";
import { defineFirestoreRetriever } from "@genkit-ai/firebase";

const collectionName = "trip-images";

export const storeImageData = async (llmResponse: ImageDocument) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection(collectionName).doc();

    const embedding = await embed({
      embedder: textEmbeddingGecko001,
      content: Document.fromText(JSON.stringify({ city: llmResponse.city })),
    });

    await docRef.set({
      ...llmResponse,
      timestamp: new Date(),
      embedding: FieldValue.vector(embedding),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error storing LLM response:", error);
    throw error;
  }
};

export const getImageRetriever = () => {
  return defineFirestoreRetriever({
    name: "image-summary",
    firestore: admin.firestore(),
    collection: collectionName,
    contentField: "city",
    vectorField: "embedding",
    embedder: textEmbeddingGecko001,
    distanceMeasure: "COSINE",
  });
};

export const getImageContextDocument = async (
  subject: string
): Promise<string> => {
  try {
    const docs = await retrieve({
      retriever: getImageRetriever(),
      query: subject,
      options: { limit: 1, minscore: 1 },
    });

    const url = docs.at(0)?.metadata?.imageURL;
    return url;
  } catch (error) {
    console.error("Error retrieving image:", error);
    throw error;
  }
};
