import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const credentialsPresent = Boolean(projectId && clientEmail && privateKey);

let app: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

if (credentialsPresent) {
  try {
    app = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
  } catch (error) {
    console.error("[firebase-admin] Unable to initialize the subscription backend.", error);
  }
}

export const isAdminFirebaseConfigured = Boolean(adminDb && adminAuth);
export { adminDb, adminAuth };
