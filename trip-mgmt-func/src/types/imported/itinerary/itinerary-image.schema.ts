import { z } from "zod";

export const imageGenerationInputSchema = z.object({
  city: z.string().describe("name of the city"),
  tags: z.string(),
});
