import { ImageDocument } from "../../models/image";
import * as admin from "firebase-admin";
import { gemini20Flash, googleAI, textEmbedding004 } from "@genkit-ai/googleai";
import { Document } from "@genkit-ai/ai/retriever";
import { defineFirestoreRetriever } from "@genkit-ai/firebase";
import { genkit } from "genkit";
import { FieldValue } from "firebase-admin/firestore";

const collectionName = "trip-images";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash, // set default model
});

export const storeImageData = async (llmResponse: ImageDocument) => {
  try {
    const db = admin.firestore();
    const docRef = db.collection(collectionName).doc();

    const embedding = (
      await ai.embed({
        embedder: textEmbedding004,
        content: Document.fromText(JSON.stringify({ city: llmResponse.city })),
      })
    )[0].embedding;

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
  return defineFirestoreRetriever(ai, {
    name: "image-summary",
    firestore: admin.firestore(),
    collection: collectionName,
    contentField: "city",
    vectorField: "embedding",
    embedder: textEmbedding004,
    distanceMeasure: "COSINE",
  });
};

export const getImageContextDocument = async (
  subject: string
): Promise<string> => {
  try {
    const docs = await ai.retrieve({
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
