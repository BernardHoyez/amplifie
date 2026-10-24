# Amplifie

PWA qui amplifie le son du microphone du smartphone et le renvoie vers la sortie audio (enceinte Bluetooth si connectée).

## Fonctionnement

1. Connecte une enceinte Bluetooth à ton téléphone.
2. Ouvre Amplifie et autorise le micro.
3. Appuie sur **Démarrer**.
4. Le son capté par le micro est amplifié et joué sur la sortie audio (donc sur l’enceinte Bluetooth).

> **Note technique** : les navigateurs web ne peuvent pas piloter directement le Bluetooth audio. L’audio est routé par le système d’exploitation. Dès qu’une enceinte Bluetooth est la sortie audio active du téléphone, le son y va automatiquement.

## Fonctionnalités

- Capture micro (Web Audio API)
- Gain réglable (amplification)
- PWA installable (Android / iOS)
- Service Worker **cache-bust** : le cache est invalidé à chaque déploiement (pas de version obsolète)

## Déploiement sur GitHub Pages

1. Crée un dépôt GitHub (ex. `amplifie`).
2. Pousse le contenu de ce dossier à la racine du dépôt (ou dans un sous-dossier).
3. Va dans **Settings → Pages**.
4. Source : **Deploy from a branch** → branche `main` (ou `gh-pages`) → dossier `/` (root) ou `/docs`.
5. L’URL sera du type :  
   `https://<ton-user>.github.io/amplifie/`

### Commandes rapides

```bash
git init
git add .
git commit -m "Amplifie PWA"
git branch -M main
git remote add origin https://github.com/<ton-user>/amplifie.git
git push -u origin main
```

Puis active GitHub Pages comme indiqué ci-dessus.

## Structure

```
amplifie/
├── index.html
├── style.css
├── app.js
├── sw.js          ← service worker cache-bust
├── manifest.json
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

## Compatibilité

- Chrome / Edge / Samsung Internet (Android) : excellent
- Safari iOS 16.4+ : PWA + micro OK (après installation sur l’écran d’accueil)
- Firefox : fonctionne, mais installation PWA limitée

## Licence

MIT – libre d’utilisation.
