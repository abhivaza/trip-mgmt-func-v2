import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createUser = functions.auth.user().onCreate(async (user) => {
  // Check if user signed in with Google
  const isGoogleProvider = user.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  if (isGoogleProvider) {
    try {
      const userDocRef = admin.firestore().collection("users").doc(user.uid);

      await userDocRef.set(
        {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          providerData: user.providerData.map((provider) => ({
            providerId: provider.providerId,
            uid: provider.uid,
            displayName: provider.displayName,
            email: provider.email,
            phoneNumber: provider.phoneNumber,
            photoURL: provider.photoURL,
          })),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastSignInTime: user.metadata.lastSignInTime || null,
          roles: ["user"],
          status: "active",
          profile: {
            emailVerified: user.emailVerified,
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
          },
        },
        { merge: true }
      );

      console.log(`Google user document created for ${user.email}`);
      return null;
    } catch (error) {
      console.error("Error creating Google user document:", error);
      return null;
    }
  }

  return null;
});
