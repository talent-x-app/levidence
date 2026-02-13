import admin from "firebase-admin";
import { readFileSync } from "node:fs";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const projectId = process.env.FIREBASE_PROJECT_ID || "carotte-b757f";
const userEmail = process.env.RESET_USER_EMAIL || "carotte@carotte-b757f.firebaseapp.com";
const collectionName = process.env.RESET_COLLECTION || "levidenceUsers";

if (!serviceAccountPath) {
  console.error("❌ Variable FIREBASE_SERVICE_ACCOUNT_PATH manquante.");
  console.error("Exemple: FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json npm run reset:user");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
} catch (error) {
  console.error("❌ Impossible de lire la clé de service:", error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId
});

const auth = admin.auth();
const db = admin.firestore();

try {
  const user = await auth.getUserByEmail(userEmail);
  const userDocRef = db.collection(collectionName).doc(user.uid);

  await userDocRef.delete();

  console.log("✅ Reset effectué.");
  console.log(`- Utilisateur: ${userEmail}`);
  console.log(`- UID: ${user.uid}`);
  console.log(`- Document supprimé: ${collectionName}/${user.uid}`);
  console.log("ℹ️ Au prochain login, l'expérience sera comme une première connexion.");
} catch (error) {
  if (error.code === "auth/user-not-found") {
    console.error(`❌ Utilisateur introuvable: ${userEmail}`);
  } else {
    console.error("❌ Échec du reset:", error.message || error);
  }
  process.exit(1);
}
