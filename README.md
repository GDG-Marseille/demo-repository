# GDG Marseille — version Vercel

Ce dossier contient les pages et les modifications du site, avec les formulaires et le calendrier adaptés à Vercel. Il remplace le paquet de déploiement PHP/Ionos pour cette mise en ligne. L’ancien projet reste conservé séparément.

## Mise en ligne

1. Mettre **le contenu de ce dossier** à la racine du dépôt GitHub destiné à ce site. Ne pas envoyer le ZIP ni les anciens exports. Pour un dépôt existant, remplacer son ancienne version du site ; ne pas mélanger les anciennes API PHP avec celles-ci.
2. Importer le dépôt dans Vercel. Choisir le preset **Other**, Node.js **22.x**, aucune commande de build, dossier de sortie **public**. Le fichier `vercel.json` contient les routes sans `.html`, les fonctions et la tâche quotidienne.
3. Dans **Settings → Environment Variables**, ajouter les valeurs de `.env.example` pour Production. Les secrets restent dans Vercel, jamais dans GitHub ni dans `public/`.
4. Ajouter le domaine dans Vercel, puis appliquer les enregistrements DNS indiqués chez le gestionnaire du domaine. Si le domaine et les e-mails restent chez Ionos, conserver les enregistrements de messagerie (MX, SPF, DKIM, DMARC). Aucun hébergement PHP Ionos n’est nécessaire pour cette version.
5. Déployer, puis vérifier les formulaires avec une adresse de test, la réception des messages, l’inscription et la désinscription newsletter. Ces vérifications réelles nécessitent les comptes et clés du propriétaire.

## Variables à fournir

| Variable | Valeur |
| --- | --- |
| `SITE_URL` | Origine publique exacte, par exemple `https://gdgmarseille.fr` ; utiliser un domaine principal et rediriger les alias vers lui. |
| `BREVO_API_KEY` | Clé API Brevo privée. |
| `BREVO_LIST_ID` | Identifiant numérique de la liste newsletter dédiée au site. |
| `BREVO_SENDER_EMAIL` | Expéditeur vérifié chez Brevo. |
| `CONTACT_TO_EMAIL` | Boîte qui reçoit les demandes de contact. |
| `PARTNER_TO_EMAIL` | Boîte qui reçoit les propositions de partenariat. |
| `TURNSTILE_SITE_KEY` | Clé publique du widget, autorisé sur le domaine déployé. |
| `TURNSTILE_SECRET_KEY` | Clé privée Turnstile. |
| `CRON_SECRET` | Secret aléatoire long (au moins 32 caractères) pour protéger la tâche de conservation. |
| `RETENTION_MODE` | `dry-run` pour vérifier les comptes, puis `live` pour activer le retrait de la liste newsletter. |

Créer dans Brevo les attributs de contact de type **texte** : `GDG_NEWSLETTER_CONSENT_AT`, `GDG_NEWSLETTER_CONSENT_VERSION`, `GDG_NEWSLETTER_CONSENT_TEXT`, `GDG_NEWSLETTER_CONSENT_SOURCE`. Les messages contact/partenariat passent par l’API transactionnelle de Brevo vers la boîte e-mail configurée.

## Conservation et newsletter

Le bouton newsletter reste désactivé tant que l’adresse est invalide ou que l’accord n’est pas coché. Le serveur vérifie aussi l’accord et Turnstile. Une inscription conserve la date et le texte de l’accord ; elle ne réactive pas un contact déjà bloqué chez Brevo.

La tâche `/api/retention` s’exécute quotidiennement selon la programmation Vercel. En mode `live`, elle retire de la **liste newsletter** les contacts dont l’accord enregistré date de trois ans, après relecture de leur fiche. Elle ne supprime pas les contacts du CRM, ni les listes d’exclusion, ni les e-mails. Une simple ouverture ne renouvelle pas la durée. Les contacts sans date exploitable sont laissés en place pour examen manuel.

Contrôler le résultat en `dry-run` avant d’activer `live`. Surveiller les exécutions dans Vercel ; une erreur est signalée avec un code HTTP d’échec, sans données personnelles. La procédure est limitée à 10 000 contacts et à la durée de la fonction. La suppression dans les boîtes e-mail, les journaux et les sauvegardes reste à organiser dans les services concernés. Le lien de désinscription doit être présent dans chaque campagne Brevo.

## Événements et vérification

Le calendrier public du groupe Meetup alimente les pages d’accueil, Événements et Nous rejoindre, sans clé Meetup. Une copie locale permet un affichage initial et sert de secours si Meetup est indisponible. Le cache en mémoire Vercel est temporaire ; les archives qui disparaissent du flux doivent être ajoutées à `public/data/events.json` pour rester disponibles durablement. Les événements nouveaux sans photo dédiée utilisent un fond neutre.

Ce paquet ne contient que les fichiers de déploiement et leurs instructions. Les tests et le serveur de prévisualisation restent dans le projet de travail séparé.

Documentation : [fonctions Node.js Vercel](https://vercel.com/docs/functions/runtimes/node-js), [tâches planifiées](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [configuration](https://vercel.com/docs/project-configuration/vercel-json).

## Structure à conserver dans GitHub

Le dossier du projet contient exactement ces entrées à sa racine :

`api/`, `lib/`, `public/`, `.env.example`, `.gitignore`, `package.json`, `README.md` et `vercel.json`.

- `api/` : les quatre points d'entrée exécutés par Vercel.
- `lib/` : les modules utilisés par ces fonctions, avec des noms distincts et descriptifs.
- `public/` : les pages, styles, scripts, données et images du site.

Extraire le ZIP, puis envoyer le contenu du dossier en conservant les sous-dossiers. Ne pas envoyer tous les fichiers à plat. Dans Vercel, laisser **Root Directory vide** (racine du dépôt), et **Output Directory : public**. Le dossier api doit être voisin de vercel.json, pas dans public.

Cette version remplace les anciens fichiers du site. Les anciens dossiers functions, les copies à la racine de fichiers appartenant à public et les fichiers suffixés « (1) » ne font pas partie de cet export. Conserver séparément les éventuels fichiers GitHub propres au dépôt.

La configuration Vercel déclare chaque fonction une seule fois, sans motif générique qui recouvre une déclaration spécifique.

La page traitement-donnees.html est uniquement une redirection conservée pour les anciens liens ; le texte complet figure dans politique-confidentialite.html.
