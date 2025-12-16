import admin from "firebase-admin";

let firebaseAdminInstance: typeof admin | null = null;

function getFirebaseAdmin() {
  if (firebaseAdminInstance) return firebaseAdminInstance;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Firebase Admin SDK not configured - missing environment variables");
    return null;
  }

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  firebaseAdminInstance = admin;
  return admin;
}

export const firebaseAdmin = getFirebaseAdmin();
