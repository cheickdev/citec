# CITEC

Site mère de l'entreprise :

- **admin.citec.app** : la direction. Tableau de bord des projets (chiffres en direct), tâches, membres, annonces, documents, présence, paie, finances.
- **member.citec.app** : l'espace de chaque membre. Ses tâches, les annonces et documents, le pointage de présence, sa paie, son mot de passe.

Un seul site Next.js. Le fichier `src/middleware.ts` choisit l'espace selon l'adresse :
- `admin.*` sert les pages de `src/app/adm` ;
- `member.*` sert les pages de `src/app/mem` ;
- l'adresse principale `citec.app` affiche une page d'accueil.

## Variables (Vercel → Settings → Environment Variables)

| Nom | Rôle |
| --- | --- |
| `DATABASE_URL` | Base Postgres (Neon) |
| `SESSION_SECRET` | Longue phrase secrète qui signe les connexions |
| `ADMIN_PHONE` | Téléphone du patron pour admin.citec.app |
| `ADMIN_PASSWORD` | Mot de passe du patron (8 caractères au moins) |
| `ADMIN_NAME` | Nom affiché du patron (facultatif) |
| `BLOB_READ_WRITE_TOKEN` | Documents partagés (Vercel Blob, accès public) |

## Domaines (Vercel → Settings → Domains)

Ajouter `admin.citec.app`, `member.citec.app` et `citec.app`, puis créer chez le fournisseur du domaine les enregistrements DNS indiqués par Vercel.

## Chiffres en direct

Chaque projet expose `GET /api/citec/stats`, protégé par `Authorization: Bearer <CITEC_STATS_KEY>`.

La réponse a cette forme : `{ ok, kpis: [{ label, value, format, hint }], revenue: [{ month, amount }] }`, avec les montants en F CFA.

La clé de chaque projet se trouve dans **admin → Projets**. Elle se met dans la variable `CITEC_STATS_KEY` du projet.

Les recettes mensuelles de chaque projet sont recopiées automatiquement dans les finances.

## Développement

```bash
npm install
npx prisma migrate dev
npm run dev   # puis http://admin.localhost:3000 et http://member.localhost:3000
```
