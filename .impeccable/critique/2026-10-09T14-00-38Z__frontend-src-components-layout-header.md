---
target: header (frontend/src/components/layout/Header)
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-10-09T14-00-38Z
slug: frontend-src-components-layout-header
---
Method: dual-agent (A: ses_edf14593bffetzNF3RoiAXKtQ2 · B: ses_edf14192effeQY5Kahd4LV4C5K)

## Score Design Health

| # | Heuristique | Score | Problème clé |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Panneau notif ignore isLoading/isError → affiche « À jour » pendant le chargement/échec ; debounce 300 ms sans indicateur |
| 2 | Match System / Real World | 2 | « Recommended », « Shop By Brand » en anglais dans un produit FR ; aria-label="Notifications" et « Panier » hors t() |
| 3 | User Control and Freedom | 2 | Escape ne ferme aucun des 6 overlays ; key={pathname} efface la requête en cours à chaque navigation |
| 4 | Consistency and Standards | 1 | Deux stacks de recherche (GlobalSearch vs SearchBar), badges panier markup différent, logo Dashboard = carré pivoté ≠ marque |
| 5 | Error Prevention | 2 | Submit vide silencieux ; logout sans confirmation ; échecs réseau avalés en console.error |
| 6 | Recognition Rather Than Recall | 2 | État du secteur non encodé dans l'URL ; isActive() compare pathname brut → 3 liens de sous-barre ne peuvent jamais s'afficher actifs |
| 7 | Flexibility and Efficiency | 2 | Recents + deep links, mais 0 raccourci clavier, 0 skip link |
| 8 | Aesthetic and Minimalist Design | 2 | Craft élevé mais 122 px de chrome permanent, font-black sur ~15 éléments, 3 accents concurrents, caméra désactivée permanente |
| 9 | Error Recovery | 1 | Aucune UI d'erreur, aucun retry ; échec de suggestions = dropdown vide |
| 10 | Help and Documentation | 1 | Seule aide du header : le title du bouton caméra mort |
| **Total** | | **17/40** | **Faible (12–19)** |

Note : ce run sonde l'état post-correctifs avec un focus nouveau sur l'a11y clavier et les lacunes mobiles, non prioritisés au premier passage (21/40) — les correctifs P0/P1/P2 de cette session sont bien appliqués et vérifiés, mais ces problèmes plus profonds étaient encore masqués.

## Verdict de spécificité

**Évaluation LLM** : le contenu est indéniablement WapiBei — villes DRC (Kinshasa/Goma/Lubumbashi), CDF/USD, Kiswahili, « Direct Producteur », catalogue congolais — il ne survivrait pas à un copy-paste ailleurs. Mais la structure n'est pas authored : CategoriesDropdown.tsx est un clone AliExpress littéral (ses propres comments le disent) qui livre des titres anglais dans un produit FR-first. La spécificité vit dans les données, pas dans la coque.

**Scan déterministe** : detect.mjs → 0 finding sur layout/Header/ (9 fichiers) et sur DashboardHeader.tsx. Le moteur est fonctionnel (test de contrôle sur admin-dashboard/.../Header.tsx → 4 findings gray-on-color), donc ce sont de vrais zéros. Le detector ne couvre pas a11y sémantique, IA ni i18n — les 6 issues ci-dessous viennent toutes de la revue A. Aucun faux positif (0 findings).

**Overlays visuels** : indisponibles — aucun playwright/puppeteer résolvable, aucun outil navigateur natif exposé. Aucune surbrillance dans le navigateur, aucune injection exécutée.

## Impression globale

Le header a un vrai craft (contrôle panier, réduction de l'en-tête sur les pages auth, panneau de notifications propre — désormais partagé) mais pas de système : deux recherches, deux patterns de notifications, des liens dont l'état actif ne peut jamais s'allumer, et une browse IA qui n'existe pas sur mobile. La plus grosse opportunité : rendre le méga-menu et les notifications utilisables au clavier — aujourd'hui ils sont entièrement souris.

## Ce qui marche

1. Le contrôle panier (DesktopHeader.tsx:203-234) : quantité en texte lisible, double-bezel, inversion au hover, cap 99+ — meilleur que l'original AliExpress copié.
2. La réduction de l'en-tête sur les pages auth (DesktopHeader:69-105) : brand + « Retour » seulement, sur les moments à plus fort enjeu (login/OTP).
3. Le NotificationDropdownPanel : rail 3px non-lu + pilule d'en-tête + footer « Voir toutes », markAsRead optimiste avec rollback — et il est maintenant unique au lieu de deux.

## Issues prioritaires

**[P0] Clavier/SR blackout sur les 2 composants les plus importants**
- Pourquoi : les rangées du méga-menu sont <div onMouseEnter onClick> sans role/tabIndex (CategoriesDropdown.tsx:756-785), les notifications pareil (NotificationDropdownPanel.tsx:84), aucun handler Escape, pas de focus trap sur le drawer, bouton fermé étiqueté « Menu ».
- Fix : rangées → <button aria-current> ; notifs → <Link> ; Escape global → ferme l'overlay au-dessus + rend le focus ; drawer → role="dialog" aria-modal + trap.
- Commande : /impeccable harden

**[P0] Mobile livré sans catégories et sans langue/devise/ville**
- Pourquoi : sous lg = 4 liens génériques seulement (index.tsx:40-45) ; LocationCurrencySelector existe uniquement en desktop. Sur un marché DRC à dominante Android bas de gamme, un locuteur Kiswahili reste bloqué en français et ne peut pas choisir sa ville (qui pilote la livraison).
- Fix : accordéon « Catégories » (top 4 + « Tout voir ») + section « Langue, devise & ville » dans MobileSidebar, en réutilisant le contenu de LocationCurrencySelector.
- Commande : /impeccable layout

**[P1] Deux implémentations de recherche non liées**
- Pourquoi : desktop GlobalSearch (secteur, recents persistés, shops+produits, spinner, empty state, CTA) vs mobile SearchBar (suggestions texte nues, sans spinner, outside-click commenté SearchBar.tsx:33-35) — la version faible tourne sur le device à plus fort trafic.
- Fix : supprimer SearchBar ; rendre GlobalSearch en mode replié/déplié dans la barre mobile.
- Commande : /impeccable distill

**[P1] Surcharge du méga-menu + fuite d'anglais**
- Pourquoi : 11 catégories sur le rail, ~40 liens dans un panneau ; « Recommended » / « Shop By Brand » codés en dur en anglais — 6 des 8 échecs de charge cognitive remontent à ce composant.
- Fix : localiser les 2 titres ; plafonner à 6 recommandés + ~16 sous-liens ; déplacer les marques vers la page catégorie ; router le rail en 2 groupes labellisés.
- Commande : /impeccable clarify

**[P2] Chaque échec réseau est invisible**
- Pourquoi : NotificationDropdownPanel ne lit ni isLoading ni isError → « À jour » est une fausse affirmation sur le statut des commandes ; échec de suggestions = dropdown vide que l'utilisateur s'auto-impute.
- Fix : lignes skeleton sur isLoading, rangée erreur + « Réessayer » sur isError, aria-live="polite" sur les compteurs.
- Commande : /impeccable harden

**[P3] Taxe de remount key={pathname}** (index.tsx:171) : remet à zéro recherche/secteur/notifs à chaque route et rejoue l'anim de fade-in. Reset via un effet, pas un remount.
- Commande : /impeccable optimize

## Persona Red Flags

Casey (mobile, une main) — ouvrir la recherche fait disparaître logo et cluster d'icônes (compteur panier compris) jusqu'au submit ; le menu n'a ni catégories ni deals ni langue ; 300 ms de suggestions texte nues sans spinner ni vignette — Casey submit à l'aveugle.

Riley (stress test) — secteur (z-40) et panneau résultats (z-50) rendus simultanément → zones mortes ; Escape ne ferme rien sur les 6 overlays ; Tab fuit derrière le drawer ; SuperDeals ne peut jamais s'activer : isActive('/products?filter=deals') compare "/products" === "/products?filter=deals".

Sam (a11y) — éléments de navigation non focusables ; non-lu signalé uniquement par un rail orange 3px ; badge panier mobile aria-hidden (desktop ne l'est pas) ; texte 9–11px sous 4.5:1 (tagline ≈3.1:1, timestamps ≈3.2:1) ; aucun focus-visible, aucun skip link.

## Observations mineures

1. aria-label="Notifications" codé en dur en anglais (index.tsx:111) quand tous les voisins passent par t().
2. DashboardHeader n'affiche aucun logo en desktop (bloc brand md:hidden) — les vendeurs perdent le contexte de marque.
3. MobileSidebar en z-[99999] contre le z-50 du header — nombre magique de lutte de stacking.
4. Panneau notif mobile épinglé fixed top-[72px] alors que le header fait 64px ou 80px — décalé de 8px dans un des deux cas.
5. Panneau notif slice(0, 5) sans « et N de plus » : pilule « 6 nouvelles » mais 5 rangées.

## Questions provocatrices

1. Si l'ADN AliExpress est assumé, pourquoi le seul composant cloné verbatim (le méga-menu) est aussi celui avec de l'anglais, 40 liens et un blackout clavier — tandis que vos inventions (contrôle panier, réduction auth) sont les meilleures pièces ?
2. Le header coûte 122 px de chrome permanent sur un site dont le hero est la grille produits — que rapporte la rangée 2 qu'une entrée méga-menu + un chip de filtre sur /products ne feraient pas ?
3. Vous livrez un switcher EN/SW, mais le méga-menu livre de l'anglais par accident — l'i18n est une feature que vous togglez ou un système que vous entretenez ?
