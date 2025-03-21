import * as admin from "firebase-admin";
import * as crypto from "crypto";

const collectionName = "users";

const actionCodeSettings = {
  url: "https://tripminder.be", // The URL to redirect to after sign-in.
  handleCodeInApp: true,
};

export const getDBUser = async (email: string) => {
  try {
    const db = admin.firestore();
    const doc = await db.collection(collectionName).doc(email).get();

    return doc.data() || null;
  } catch (error) {
    console.error("Error retrieving itinerary:", error);
    throw error;
  }
};

export const signupUser = async (email: string) => {
  try {
    await admin.auth().createUser({
      email,
      password: generateRandomPassword(),
      emailVerified: true,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

const generateRandomPassword = (length = 12): string => {
  // Define character sets
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + symbols;

  // Generate random bytes and map them to our character set
  let password = "";
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % allChars.length;
    password += allChars[randomIndex];
  }

  // Ensure password has at least one character from each set
  password =
    uppercase[crypto.randomInt(uppercase.length)] +
    lowercase[crypto.randomInt(lowercase.length)] +
    numbers[crypto.randomInt(numbers.length)] +
    symbols[crypto.randomInt(symbols.length)] +
    password.slice(4);

  return password;
};
