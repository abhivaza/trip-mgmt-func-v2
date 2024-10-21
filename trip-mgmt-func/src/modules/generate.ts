import * as z from "zod";

import { generate } from "@genkit-ai/ai";
import { configureGenkit } from "@genkit-ai/core";
import { firebase } from "@genkit-ai/firebase";
import { gemini15Flash, googleAI } from "@genkit-ai/googleai";

import { defineFlow } from "@genkit-ai/flow";

configureGenkit({
  plugins: [
    firebase(),
    // Load the Google AI plugin. You can optionally specify your API key
    // by passing in a config object; if you don't, the Google AI plugin uses
    // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
    // the recommended practice.
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
  ],
  // Log debug output to tbe console.
  logLevel: "debug",
  // Perform OpenTelemetry instrumentation and enable trace collection.
  enableTracingAndMetrics: true,
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
export const menuSuggestionFlow = defineFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
    // authPolicy: firebaseAuth((user) => {
    //   // By default, the firebaseAuth policy requires that all requests have an
    //   // `Authorization: Bearer` header containing the user's Firebase
    //   // Authentication ID token. All other requests are rejected with error
    //   // 403. If your app client uses the Cloud Functions for Firebase callable
    //   // functions feature, the library automatically attaches this header to
    //   // requests.
    //   // You should also set additional policy requirements as appropriate for
    //   // your app. For example:
    //   // if (!user.email_verified) {
    //   //   throw new Error("Verified email required to run flow");
    //   // }
    // }),
  },
  async (subject) => {
    // Construct a request and send it to the model API.
    const prompt = `Suggest an item for the menu of a ${subject} themed restaurant`;
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    // Handle the response from the model API. In this sample, we just
    // convert it to a string, but more complicated flows might coerce the
    // response into structured output or chain the response into another
    // LLM call, etc.
    return llmResponse.text();
  }
);
