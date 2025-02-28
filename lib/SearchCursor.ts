/**
 * Classe utilitaire pour rechercher des occurrences dans un document.
 * Implémentation simplifiée pour la recherche de texte.
 */
export default class SearchCursor {
  doc: any;
  query: any;
  pos: number;
  end: number;
  done: boolean;
  value: { from: number, to: number };

  /**
   * Crée un curseur de recherche
   * @param doc Le document dans lequel rechercher
   * @param query La requête de recherche (texte ou expression régulière)
   * @param from Position de départ (par défaut: 0)
   * @param to Position de fin (par défaut: longueur du document)
   */
  constructor(doc: any, query: any, from?: number, to?: number) {
    this.doc = doc;
    this.query = query;
    this.pos = from || 0;
    this.end = to !== undefined ? to : doc.length;
    this.done = false;
    this.value = { from: 0, to: 0 };
    this.findNext();
  }

  /**
   * Trouve la prochaine occurrence
   * @returns L'occurrence trouvée ou undefined si rien n'est trouvé
   */
  findNext() {
    if (this.pos >= this.end) {
      this.done = true;
      return;
    }

    const content = this.doc.sliceString(this.pos, this.end);
    const searchStr = typeof this.query === 'string' ? this.query : (this.query.search || "");
    
    if (!searchStr) {
      this.done = true;
      return;
    }
    
    const idx = content.indexOf(searchStr);
    if (idx === -1) {
      this.done = true;
      return;
    }
    
    this.value = {
      from: this.pos + idx,
      to: this.pos + idx + searchStr.length
    };
    
    this.pos = this.value.to;
    return this.value;
  }

  /**
   * Alias pour findNext
   * @returns L'occurrence trouvée ou undefined si rien n'est trouvé
   */
  next() {
    return this.findNext();
  }
} 