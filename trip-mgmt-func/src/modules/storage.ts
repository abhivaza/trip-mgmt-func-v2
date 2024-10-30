import * as admin from "firebase-admin";

const getBlobStorage = () => admin.storage();

export const uploadImageBuffer = async (
  buffer: Uint8Array,
  destinationPath: string
) => {
  try {
    const bucket = getBlobStorage().bucket();
    const file = bucket.file(destinationPath);

    // Upload the buffer
    await file.save(buffer, {
      metadata: {
        contentType: "image/jpeg", // Set appropriate content type
      },
    });

    console.log(`Image buffer uploaded successfully to ${destinationPath}`);
  } catch (error) {
    console.error("Error uploading image buffer:", error);
  }
};
