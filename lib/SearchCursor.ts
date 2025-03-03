/**
 * Utility class for searching occurrences in a document.
 * Simplified implementation for text search.
 */
export default class SearchCursor {
  doc: any;
  query: any;
  pos: number;
  end: number;
  done: boolean;
  value: { from: number, to: number };

  /**
   * Creates a search cursor
   * @param doc The document to search in
   * @param query The search query (text or regular expression)
   * @param from Starting position (default: 0)
   * @param to End position (default: document length)
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
   * Finds the next occurrence
   * @returns The found occurrence or undefined if nothing is found
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
   * Alias for findNext
   * @returns The found occurrence or undefined if nothing is found
   */
  next() {
    return this.findNext();
  }
} 