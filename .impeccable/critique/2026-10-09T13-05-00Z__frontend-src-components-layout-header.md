---
target: frontend/src/components/layout/Header
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-10-09T13-05-00Z
slug: frontend-src-components-layout-header
---
# Critique du Header WapiBei

**Cible :** frontend/src/components/layout/Header/ (10 fichiers .tsx)

## Design Health Score

| # | Heuristique | Score | Problème clé |
|---|-------------|-------|--------------|
| 1 | Visibilité de l'état du système | 3 | bouton caméra alert() au lieu d'un état "bientôt" |
| 2 | Adéquation système ↔ monde réel | 3 | "Recommended"/"Shop By Brand"/"SuperDeals" brisent la voix |
| 3 | Contrôle et liberté | 2 | Pas d'Escape sur overlays ; SearchBar outside-close commentée |
| 4 | Cohérence et standards | 2 | 3 icônes, 3 recherches, 2 notifs, 3 logos, 5+ rayons |
| 5 | Prévention des erreurs | 1 | alert() ; déconnexion 1 clic ; "Appliquer" sans persistance |
| 6 | Reconnaissance vs mémorisation | 3 | Secteur "TOUT" inexpliqué ; ville tronquée 55px |
| 7 | Flexibilité et efficacité | 3 | Pas de raccourci / ; mega-menu hover-only |
| 8 | Esthétique minimaliste | 2 | Pile 122px + mega-menu ≈ 35 cliquables |
| 9 | Reconnaissance/récupération erreurs | 1 | Échec fetch = console.error seul ; aucun toast |
| 10 | Aide et documentation | 1 | Zéro tooltip ; footer mega-menu = marketing |
| **Total** | | **21/40** | **Acceptable** (52%) |

## Design Specificity

Interchangeable par catégorie (ADN AliExpress documenté dans le code) avec une couche de données congolaise authentique (mega-menu, sélecteur ville×devise). Photos Unsplash recyclées, marques fictives à côté de vraies sans badge vérification.

## Priority Issues

- P0: Recherche produit routée vers /compare au lieu de /products (GlobalSearch.tsx:100-118, SearchBar.tsx:67)
- P0: Bouton caméra alert() navigateur (GlobalSearch.tsx:242-251)
- P1: Sous-barre 9 options indifférenciées (DesktopHeader.tsx:382-420)
- P1: Sélecteur ville cosmétique, non branché (LocationCurrencySelector.tsx:32)
- P2: 3 icônes, 3 recherches, 2 notifs, composants morts (DesktopNav, AppDownloadDropdown)

## Persona Red Flags

- Alex: mega-menu hover-only ; ProfileDropdown vendeur pauvre vs MobileSidebar
- Jordan: 1ère recherche → /compare ; alert() caméra ; sidebar carte compte avant navigation
- Casey: recherche mobile cache logo+panier ; badges tailles incohérentes

## Fixes appliqués (session courante)

1. GlobalSearch handleSubmit + handleSuggestionClick: /compare → /products
2. SearchBar handleSearch: /compare → /products
3. Bouton caméra: alert() → disabled + aria-disabled + tooltip "bientôt disponible"
