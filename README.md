# levidence

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