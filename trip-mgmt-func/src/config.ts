import { defineString } from "firebase-functions/params";

interface FirebaseConfig {
  serviceAccount: {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain: string;
  };
  genAIConfig: {
    googleAIApiKey: string;
  };
}

interface AppConfig {
  appConfig: {
    corsOrigin: string[];
  };
}

export const getFirebaseConfig = (): FirebaseConfig => {
  return {
    serviceAccount: {
      type: "service_account",
      project_id: defineString("SERVICE_ACCT_FIREBASE_PROJECT_ID").value(),
      private_key_id: defineString("SERVICE_ACCT_PRIVATE_KEY_ID").value(),
      private_key: defineString("SERVICE_ACCT_FIREBASE_PRIVATE_KEY").value(),
      client_email: defineString("SERVICE_ACCT_FIREBASE_CLIENT_EMAIL").value(),
      client_id: defineString("SERVICE_ACCT_CLIENT_ID").value(),
      auth_uri: defineString("SERVICE_ACCT_AUTH_URI").value(),
      token_uri: defineString("SERVICE_ACCT_TOKEN_URI").value(),
      auth_provider_x509_cert_url: defineString(
        "SERVICE_ACCT_AUTH_PROVIDER_X509_CERT_URL"
      ).value(),
      client_x509_cert_url: defineString(
        "SERVICE_ACCT_CLIENT_X509_CERT_URL"
      ).value(),
      universe_domain: defineString("SERVICE_ACCT_UNIVERSE_DOMAIN").value(),
    },
    genAIConfig: {
      googleAIApiKey: defineString("APP_GOOGLE_GENAI_API_KEY").value(),
    },
  };
};

export const getAppConfig = (): AppConfig => {
  return {
    appConfig: {
      corsOrigin: defineString("APP_CORS_ORIGIN_DOMAINS").value().split(","),
    },
  };
};
