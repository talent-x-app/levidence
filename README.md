# levidence

## Reset admin en 1 clic (hors interface)

Objectif : remettre l’utilisateur à l’état "première connexion" sans passer par l’UI.

### 1) Préparer une clé service Firebase

- Firebase Console → `Project settings` → `Service accounts`
- `Generate new private key`
- Sauvegarde le fichier JSON (ex: `service-account.json`) à la racine du projet

### 2) Installer la dépendance admin

```bash
npm install
```

### 3) Lancer le reset

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json npm run reset:user
```

Ce script :

- retrouve l’utilisateur `carotte@carotte-b757f.firebaseapp.com`
- supprime `levidenceUsers/{uid}` dans Firestore
- force un retour à l’état initial au prochain login

### Variables optionnelles

- `FIREBASE_PROJECT_ID` (par défaut: `carotte-b757f`)
- `RESET_USER_EMAIL` (par défaut: `carotte@carotte-b757f.firebaseapp.com`)
- `RESET_COLLECTION` (par défaut: `levidenceUsers`)

## Connexion et synchro multi-appareils (Firebase)

Objectif : se connecter en email/mot de passe et retrouver brouillon + récap sur un autre appareil.

### 1) Créer le projet Firebase

- Ouvre Firebase Console
- Crée un projet
- Ajoute une application Web
- Copie la config (`apiKey`, `authDomain`, `projectId`, `appId`)

### 2) Activer l’authentification

- `Authentication` → `Sign-in method`
- Active `Email/Password`

### 3) Activer Firestore

- `Firestore Database` → créer la base
- Mode production (ou test temporaire)

Règles minimales recommandées :

```text
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /levidenceUsers/{userId} {
			allow read, write: if request.auth != null && request.auth.uid == userId;
		}
	}
}
```

### 4) Renseigner la config dans le code

Dans [index.html](index.html) et [recap.html](recap.html), complète l’objet `FIREBASE_CONFIG` :

```javascript
const FIREBASE_CONFIG = {
	apiKey: "...",
	authDomain: "...",
	projectId: "...",
	appId: "..."
};
```

Une fois rempli, l’utilisateur peut se connecter et retrouver ses données sur n’importe quel appareil.

## Suivi en temps réel dans Google Sheets

Objectif : à chaque clic sur "Valider notre menu", ajouter une nouvelle ligne dans Google Sheets.

### 1) Créer la feuille

Crée (ou renomme) un onglet en `Réservations`, puis ajoute les colonnes suivantes en ligne 1 :

- `submittedAt`
- `statut`
- `mise`
- `entree`
- `plat`
- `dessert`
- `page`

### 2) Créer le script Apps Script

Dans la feuille : `Extensions` → `Apps Script`, puis colle ce code :

```javascript
function doPost(e) {
	const SHEET_NAME = "Réservations";
	const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = spreadsheet.getSheetByName(SHEET_NAME);

	if (!sheet) {
		return ContentService
			.createTextOutput(JSON.stringify({ ok: false, error: "Onglet Réservations introuvable" }))
			.setMimeType(ContentService.MimeType.JSON);
	}

	const body = JSON.parse(e.postData.contents || "{}");

	sheet.appendRow([
		body.submittedAt || new Date().toISOString(),
		body.statut || "nouvelle",
		body.mise || "",
		body.entree || "",
		body.plat || "",
		body.dessert || "",
		body.page || ""
	]);

	return ContentService
		.createTextOutput(JSON.stringify({ ok: true }))
		.setMimeType(ContentService.MimeType.JSON);
}
```

### 3) Déployer en Web App

- `Déployer` → `Nouveau déploiement`
- Type : `Application web`
- `Qui a accès` : `Tout le monde`
- Copie l’URL de déploiement

### 4) Brancher l’URL dans le projet

Dans [index.html](index.html), renseigne :

`const GOOGLE_SHEETS_WEBHOOK_URL = "TON_URL_APPS_SCRIPT";`

Optionnel : personnaliser le statut envoyé automatiquement :

`const GOOGLE_SHEETS_DEFAULT_STATUS = "nouvelle";`

Une fois l’URL ajoutée, chaque validation enverra automatiquement une ligne dans la feuille.