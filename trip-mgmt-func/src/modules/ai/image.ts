import { generate } from "@genkit-ai/ai";
import { defineFlow } from "@genkit-ai/flow";
import { imagen3 } from "@genkit-ai/vertexai";
import parseDataURL from "data-urls";
import { imageGenerationInputSchema } from "../../models/image";
import { uploadImageBuffer } from "../storage";
import { storeImageData } from "../database/image";

export const tripImageGenerationFlow = defineFlow(
  {
    name: "tripImageGenerationFlow",
    inputSchema: imageGenerationInputSchema,
  },
  async (input) => {
    // Construct a request and send it to the model API.
    const prompt = `Limit the image size to 1MB. The image should be in JPEG format.
        Give all these instructions, and these tags: ${input.tags}, 
        create an image of random landmark of the following city: ${input.city}.`;

    const mediaResponse = await generate({
      model: imagen3,
      prompt: prompt,
      output: { format: "media" },
    });
    const media = mediaResponse.media();
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
