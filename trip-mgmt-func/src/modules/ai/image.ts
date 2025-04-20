import { defineFlow } from "@genkit-ai/flow";
import vertexAI, { imagen3 } from "@genkit-ai/vertexai";
import parseDataURL from "data-urls";
import { imageGenerationInputSchema } from "../../types/image";
import { uploadImageBuffer } from "../storage";
import { storeImageData } from "../database/image";
import { genkit } from "genkit";

const ai = genkit({
  plugins: [vertexAI()],
  model: imagen3,
});

export const tripImageGenerationFlow = defineFlow(
  {
    name: "tripImageGenerationFlow",
    inputSchema: imageGenerationInputSchema,
  },
  async (input) => {
    // Construct a request and send it to the model API.
    const prompt = `You are acting as travel advisor.
        Limit the image size to maximum 1MB. The image should be in JPEG format.
        The image should be a banner image in landscape orientation.
        Use vibrant color palette. 
        Make collage of various landmarks around given place if available.
        Use all supplied tags to customize the image.
        Give all these instructions, create an image of the given city.
        Tags: ${input.tags}.
        Place: ${input.city}.`;

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
