export interface PaginationProps {
  /** Page actuellement affichée (1-indexed) */
  currentPage: number;
  /** Nombre total de pages */
  totalPages: number;
  /** Callback appelé lors d'un changement de page */
  onPageChange: (page: number) => void;
  /** (Optionnel) Nombre total d'items — active le compteur "X–Y / total" */
  totalItems?: number;
  /** (Optionnel) Items par page — requis si totalItems est fourni */
  itemsPerPage?: number;
  /** (Optionnel) Items réellement affichés sur la page courante */
  itemsOnPage?: number;
}
