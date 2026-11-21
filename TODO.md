# Aetheris Cloud — API Hub

- [x] Ajouter un registre central extensible des fournisseurs avec identifiant, nom, catégorie, documentation, URL de service, authentification, limites et variable serveur.
  - Aucun fournisseur ne doit être présenté comme connecté sans configuration réelle.
  - Le registre doit couvrir les fournisseurs de la mission et permettre l'ajout ultérieur sans reconstruire l'interface.
- [x] Ajouter les pages API Hub, AI Hub, Agent Hub, Developer Hub et Infrastructure & Monitoring dans l'architecture de navigation existante.
  - Les pages doivent réutiliser le design, les composants et les tokens existants.
  - Les états non configuré, disponible, erreur et test en cours doivent être distincts.
- [x] Ajouter API Keys & Providers avec une explication de configuration côté serveur.
  - Les secrets ne doivent jamais être renvoyés au navigateur ni écrits dans le code frontend.
- [x] Ajouter Usage & Statistics avec un état honnête tant qu'aucun stockage de métriques n'est configuré.
  - Ne pas afficher de chiffres inventés.
- [x] Ajouter des route handlers protégés pour lire le catalogue public et tester un fournisseur configuré.
  - Le test doit appliquer un timeout et ne jamais simuler une réussite lorsque la configuration manque.
- [x] Ajouter le manifeste des routes et valider typecheck, lint ciblé et build.
- [ ] Ajouter Supabase/RLS, le stockage chiffré des clés, les statistiques persistées, les journaux d'erreurs et les intégrations propres à chaque API.
- [ ] Préparer le déploiement Render de SearXNG et tester chaque connecteur avec ses endpoints officiels et ses quotas confirmés.
