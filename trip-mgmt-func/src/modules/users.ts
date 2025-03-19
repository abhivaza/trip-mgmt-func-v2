import * as admin from "firebase-admin";
import { UserRecord } from "firebase-admin/auth";

export const createUser = async (user: UserRecord) => {
  try {
    const userDocRef = admin.firestore().collection("users").doc(user.uid);

    const providerInfo = user.providerData.map((provider) => ({
      providerId: provider.providerId,
      email: provider.email || "",
      displayName: provider.displayName || "",
      photoURL: provider.photoURL || "",
      phoneNumber: provider.phoneNumber || "",
    }));

    await userDocRef.set(
      {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSignInTime: user.metadata.lastSignInTime || null,
        status: "active",
        profile: {
          emailVerified: user.emailVerified || false,
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        },
        providers: providerInfo,
      },
      { merge: true }
    );

    return null;
  } catch (error) {
    console.error("Error creating user document:", error);
    return null;
  }
};
