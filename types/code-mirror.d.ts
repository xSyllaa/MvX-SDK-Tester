/**
 * Types pour l'API de recherche CodeMirror
 */

import { EditorView } from "codemirror"

// Interface pour les contrôles de recherche
export interface CodeMirrorSearchControls {
  /**
   * Recherche une chaîne dans l'éditeur
   * @param query Texte à rechercher
   */
  search: (query: string) => void;
  
  /**
   * Navigue vers l'occurrence suivante
   * @returns Résultat de recherche actuel ou null si aucun résultat
   */
  findNext: () => SearchResult | null;
  
  /**
   * Navigue vers l'occurrence précédente
   * @returns Résultat de recherche actuel ou null si aucun résultat
   */
  findPrevious: () => SearchResult | null;
  
  /**
   * Récupère les informations de recherche actuelles
   * @returns Informations sur la recherche en cours
   */
  getSearchInfo: () => SearchResult;
  
  /**
   * Vérifie si la recherche est ouverte
   * @returns true si le panneau de recherche est ouvert
   */
  isSearchOpen: () => boolean;
  
  /**
   * Ferme la recherche et efface les surbrillances
   */
  closeSearch: () => void;
}

/**
 * Résultat de recherche indiquant la position actuelle et le nombre total d'occurrences
 */
export interface SearchResult {
  /** Indice de l'occurrence actuelle (1-indexed) */
  current: number;
  /** Nombre total d'occurrences trouvées */
  total: number;
}

// Étendre l'interface Window pour inclure nos contrôles
declare global {
  interface Window {
    cm?: EditorView;
    cmSearchControls?: CodeMirrorSearchControls;
    openCodeMirrorSearch?: () => void;
  }
} 