import { defineFlow } from "@genkit-ai/flow";
import vertexAI, { imagen3Fast } from "@genkit-ai/vertexai";
import parseDataURL from "data-urls";
import { uploadImageBuffer } from "../storage";
import { storeImageData } from "../database/image";
import { genkit } from "genkit";
import { imageGenerationInputSchema } from "../../types/imported";

const ai = genkit({
  plugins: [vertexAI()],
  model: imagen3Fast,
});

export const tripImageGenerationFlow = defineFlow(
  {
    name: "tripImageGenerationFlow",
    inputSchema: imageGenerationInputSchema,
  },
  async (input) => {
    // Construct a request and send it to the model API.
    const prompt = `Limit the image size to 1MB. The image should be in JPEG format.
        The image should be in a landscape orientation.
        Use vibrant color palette. And use water color effect.
        Use all supplied tags to customize the image.
        Give all these instructions, create an image of the given city.
        Tags: ${input.tags}.
        City: ${input.city}.`;

    const mediaResponse = await ai.generate({
      prompt: prompt,
      output: { format: "media" },
    });
    const media = mediaResponse.media;
    if (!media) throw new Error("No media generated.");

    const data = parseDataURL(media.url);
    if (!data) throw new Error("Invalid data URL.");

    // Convert the parsed data URL to a Uint8Array or Blob for Firebase Storage
    const imageBytes = new Uint8Array(data.body); // Adjust if `data.body` format differs
    const fileName = `image-${Date.now()}.jpeg`;

    const url = await uploadImageBuffer(imageBytes, fileName);
    storeImageData({ ...input, imageURL: url });
    return url;
  }
);
