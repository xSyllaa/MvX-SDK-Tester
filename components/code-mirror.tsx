"use client"

import { useEffect, useState, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { markdown } from "@codemirror/lang-markdown"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { EditorState, EditorSelection } from "@codemirror/state"
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language"
import { tags } from "@lezer/highlight"
import { search, findNext, findPrevious, SearchQuery, setSearchQuery } from "@codemirror/search"
import { keymap } from "@codemirror/view"
import SearchCursor from "@/lib/SearchCursor"
import { CodeMirrorSearchControls, SearchResult } from "@/types/code-mirror"

// Global declaration for TypeScript
declare global {
  interface Window {
    openCodeMirrorSearch?: () => void;
  }
}

interface CodeMirrorProps {
  value: string
  height?: string
  filename?: string
  onSearchToggle?: (isOpen: boolean) => void
}

export function CodeMirror({ value, height = "100%", filename, onSearchToggle }: CodeMirrorProps) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const editorViewRef = useRef<EditorView | null>(null)
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const searchQueryRef = useRef<string>("");
  const currentMatchRef = useRef<number>(0);
  const lastQueryRef = useRef<string>("");
  
  // Variables d'état pour le suivi de recherche
  const searchStateRef = useRef({
    currentMatch: 0,
    totalMatches: 0,
    lastQuery: ""
  });

  // Function to count occurrences
  const countMatches = (text: string, searchText: string): number => {
    if (!searchText) return 0;
    
    // Simple implementation
    const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  };

  // Fonction pour mettre à jour les surlignages de recherche
  const updateSearchHighlightInComponent = (query: string, view: EditorView) => {
    try {
      // Si la requête est vide, on efface les highlights en créant une requête vide
      if (!query) {
        const emptySearchQuery = new SearchQuery({
          search: "",
          caseSensitive: false,
          regexp: false
        });
        view.dispatch({ effects: setSearchQuery.of(emptySearchQuery) });
        
        // Réinitialiser les compteurs
        searchStateRef.current.currentMatch = 0;
        searchStateRef.current.totalMatches = 0;
        searchStateRef.current.lastQuery = "";
        return;
      }
      
      // Créer la requête de recherche avec les options appropriées
      const searchQuery = new SearchQuery({
        search: query,
        caseSensitive: false,
        regexp: false
      });
      
      // Sauvegarder la dernière requête
      searchStateRef.current.lastQuery = query;
      
      // Appliquer la requête de recherche à la vue
      view.dispatch({ effects: setSearchQuery.of(searchQuery) });
      
      // Positionner le curseur au début du document
      view.dispatch({ selection: EditorSelection.cursor(0) });
      
      // Trouver et compter tous les résultats
      const searchResults = findSearchResultsInComponent(query, view);
      if (searchResults) {
        searchStateRef.current.currentMatch = searchResults.current;
        searchStateRef.current.totalMatches = searchResults.total;
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des highlights de recherche:", error);
    }
  };

  // Fonction pour récupérer tous les résultats de recherche triés par position
  const getAllSearchMatches = (query: string, view: EditorView): Array<{from: number, to: number}> => {
    if (!query || !view) return [];
    
    const matches: Array<{from: number, to: number}> = [];
    const doc = view.state.doc;
    
    // Recherche insensible à la casse
    const searchText = query.toLowerCase();
    const fullText = doc.toString().toLowerCase();
    
    let pos = 0;
    let idx = fullText.indexOf(searchText, pos);
    
    while (idx !== -1) {
      // Utiliser l'index dans le texte en minuscules pour trouver la position réelle
      const from = idx;
      const to = from + searchText.length;
      matches.push({ from, to });
      
      pos = to;
      idx = fullText.indexOf(searchText, pos);
    }
    
    // Trier par position dans le document
    matches.sort((a, b) => a.from - b.from);
    
    return matches;
  };

  // Modifier les fonctions de navigation pour parcourir les résultats dans l'ordre des lignes
  const navigateToMatch = (view: EditorView, direction: 'next' | 'previous'): SearchResult | null => {
    if (!searchStateRef.current.lastQuery) return null;
    
    // Récupérer tous les résultats triés
    const matches = getAllSearchMatches(searchStateRef.current.lastQuery, view);
    const total = matches.length;
    
    if (total === 0) return null;
    
    // Récupérer la position actuelle
    let current = searchStateRef.current.currentMatch;
    
    // Déterminer la nouvelle position en fonction de la direction
    if (direction === 'next') {
      current = current < total ? current + 1 : 1; // Boucler au début
    } else {
      current = current > 1 ? current - 1 : total; // Boucler à la fin
    }
    
    // S'assurer que l'index est valide
    if (current < 1 || current > matches.length) return null;
    
    // Naviguer vers le résultat
    const match = matches[current - 1];
    view.dispatch({
      selection: EditorSelection.range(match.from, match.to),
      scrollIntoView: true
    });
    
    // Mettre à jour l'état
    searchStateRef.current.currentMatch = current;
    searchStateRef.current.totalMatches = total;
    
    return { current, total };
  };

  // Fonction pour trouver et compter les résultats de recherche
  const findSearchResultsInComponent = (query: string, view: EditorView): SearchResult | null => {
    if (!query || !view) return null;
    
    try {
      // Récupérer tous les résultats triés
      const matches = getAllSearchMatches(query, view);
      
      // Mettre à jour le compteur total
      const total = matches.length;
      searchStateRef.current.totalMatches = total;
      
      // Si aucun résultat, retourner 0/0
      if (total === 0) {
        return { current: 0, total: 0 };
      }
      
      // Identifier la position actuelle du curseur
      const cursor = view.state.selection.main.head;
      
      // Déterminer la position actuelle parmi les résultats
      let currentPos = 0;
      for (let i = 0; i < matches.length; i++) {
        if (cursor >= matches[i].from && cursor <= matches[i].to) {
          currentPos = i + 1; // Position 1-indexed pour l'affichage
          break;
        }
      }
      
      // Si le curseur n'est sur aucun résultat, trouver le résultat le plus proche en dessous
      if (currentPos === 0) {
        // Trouver le premier résultat après la position actuelle du curseur
        for (let i = 0; i < matches.length; i++) {
          if (matches[i].from >= cursor) {
            currentPos = i + 1;
            break;
          }
        }
        
        // Si aucun résultat n'est trouvé après le curseur, prendre le premier
        if (currentPos === 0) {
          currentPos = 1;
        }
        
        // Positionner le curseur sur ce résultat
        const match = matches[currentPos - 1];
        view.dispatch({
          selection: EditorSelection.range(match.from, match.to),
          scrollIntoView: true
        });
      }
      
      searchStateRef.current.currentMatch = currentPos;
      return { current: currentPos, total };
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!element) return

    // Custom highlight style that better matches Cursor with readable colors
    const cursorHighlightStyle = HighlightStyle.define([
      { tag: tags.keyword, color: "#0000ff" },        // Blue for keywords (import, from, function, const...)
      { tag: tags.operator, color: "#000000" },       // Black for operators for better readability
      { tag: tags.string, color: "#a31515" },         // Dark red for strings
      { tag: tags.function(tags.variableName), color: "#795E26" }, // Brown/gold for functions
      { tag: tags.comment, color: "#008000" },        // Bright green for comments
      { tag: tags.number, color: "#098658" },         // Dark green for numbers
      { tag: tags.bool, color: "#0000ff" },           // Blue for booleans
      { tag: tags.className, color: "#267f99" },      // Dark blue-green for classes (more readable)
      { tag: tags.definition(tags.variableName), color: "#001080" }, // Dark blue for variable definitions
      { tag: tags.propertyName, color: "#001080" },   // Dark blue for properties
      { tag: tags.typeName, color: "#267f99" },       // Dark blue-green for types
      { tag: tags.variableName, color: "#001080" },   // Dark blue for variables
      { tag: tags.attributeName, color: "#ff0000" },  // Red for attributes
      { tag: tags.heading, color: "#0000ff", fontWeight: "bold" },
      { tag: tags.content, color: "#000000" },        // General text in black for readability
      { tag: tags.meta, color: "#000000" },           // Meta info in black
    ])

    // Theme for the light mode interface with search styling
    const cursorTheme = EditorView.theme({
      "&": {
        fontSize: "13px",
        backgroundColor: "transparent"
      },
      ".cm-content": {
        caretColor: "#5cadff",
        fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
        color: "#000000",                        
        marginLeft: "8px"                       // Marge pour séparer du code de la gouttière
      },
      ".cm-gutters": {
        backgroundColor: "#f5f5f5",              // Gris clair pour les gouttières
        border: "none",
        borderRight: "2px solid #e0e0e0",        // Bordure plus visible
        color: "#666666",                        // Couleur plus foncée pour les numéros
        position: "sticky",                      
        left: 0,                                
        zIndex: 20,                             
        minWidth: "40px",                        // Largeur minimale
        paddingRight: "0",                       // Supprimer l'espace à droite
        boxShadow: "3px 0 6px rgba(0, 0, 0, 0.15)", // Ombre projetée
        display: "flex"                          // Aligner les gouttières horizontalement
      },
      ".cm-activeLineGutter": {
        backgroundColor: "rgba(0, 0, 0, 0.12)",  // Plus visible pour la ligne active
        fontWeight: "bold",                      // Gras pour le numéro de ligne active
        width: "100%",                          // Étendre à toute la largeur
        margin: "0",                            // Supprimer les marges
        padding: "0"                            // Supprimer les paddings
      },
      ".cm-selectionMatch": {
        backgroundColor: "rgba(181, 213, 255, 0.5)"
      },
      ".cm-line": {
        padding: "0 4px"
      },
      ".cm-activeLine": {
        backgroundColor: "rgba(0, 0, 0, 0.07)"   // Légèrement plus foncé
      },
      ".cm-scroller": {
        overflow: "auto",      
        fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
        backgroundColor: "#ffffff"               // Fond blanc pour le code
      },
      // Amélioration des styles de numérotation de ligne
      ".cm-lineNumbers": {
        zIndex: 20,
        minWidth: "30px",                       // Largeur minimale pour les numéros
        padding: "0",                           // Supprimer le padding
        margin: "0"                             // Supprimer la marge
      },
      ".cm-lineNumbers .cm-gutterElement": {
        padding: "0 4px",                       // Réduire le padding
        minWidth: "2ch", 
        textAlign: "right",
        width: "100%"                           // Étendre à toute la largeur disponible
      },
      // Styles spécifiques pour les flèches de pliage
      ".cm-foldGutter": {
        position: "sticky",
        left: "0",
        paddingRight: "0",                      // Supprimer l'espace à droite
        paddingLeft: "0",                       // Supprimer l'espace à gauche
        zIndex: 21,
        margin: "0"                             // Supprimer les marges
      },
      ".cm-foldGutter-open:after": {
        content: '"▼"',
        fontSize: "10px",
        color: "#555"
      },
      ".cm-foldGutter-folded:after": {
        content: '"►"',
        fontSize: "10px",
        color: "#555"
      },
      ".cm-foldGutter-open, .cm-foldGutter-folded": {
        fontSize: "16px", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "16px",
        height: "16px",
        cursor: "pointer"
      },
      "&.cm-focused .cm-cursor": {
        borderLeftWidth: "2px",
        borderLeftColor: "#000000"
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
        backgroundColor: "rgba(181, 213, 255, 0.5)"
      },
      // Highlight search matches
      ".cm-searchMatch": {
        backgroundColor: "rgba(255, 235, 0, 0.3)",
      },
      // Active search match
      ".cm-searchMatch-selected": {
        backgroundColor: "rgba(255, 165, 0, 0.5)",
      },
    });

    // Basic setup with additional options
    const extensions = [
      basicSetup, 
      cursorTheme,
      syntaxHighlighting(cursorHighlightStyle),
      EditorView.editable.of(false), // Read-only mode
      EditorState.readOnly.of(true), // Double security for read-only
      search({
        caseSensitive: false
      })
    ]

    // Language support based on file extension
    if (filename) {
      const ext = filename.split(".").pop()?.toLowerCase()
      switch (ext) {
        case "js":
        case "jsx":
        case "ts":
        case "tsx":
          extensions.push(javascript())
          break
        case "md":
          extensions.push(markdown())
          break
        case "json":
          extensions.push(json())
          break
        case "html":
        case "htm":
        case "xml":
        case "svg":
          extensions.push(html())
          break
        case "css":
        case "scss":
        case "less":
          extensions.push(css())
          break
        case "py":  // Basic support for Python
          extensions.push(javascript({ jsx: false, typescript: false }))
          break
        // Fallback for other extensions
        default:
          extensions.push(javascript({ jsx: false, typescript: false }))
          break
      }
    }

    const state = EditorState.create({
      doc: value,
      extensions: extensions,
    })

    const view = new EditorView({
      state,
      parent: element,
    })

    editorViewRef.current = view;

    // API for controlling search
    window.cmSearchControls = {
      search: (query: string) => {
        if (!editorViewRef.current) return;
        
        const view = editorViewRef.current;
        
        // Save the query for later use
        searchQueryRef.current = query;
        
        if (query) {
          // Count total matches
          const text = view.state.doc.toString();
          const totalFound = countMatches(text, query);
          setTotalMatches(totalFound);
          
          if (totalFound > 0) {
            // Apply the search
            updateSearchHighlightInComponent(query, view);
            
            // Toujours définir la position actuelle à 1 lors d'une nouvelle recherche
            setCurrentMatch(1);
            currentMatchRef.current = 1;
            lastQueryRef.current = query;

            // Log pour débogage
            console.log(`Recherche: "${query}" - trouvé ${totalFound} occurrences, position actuelle: 1`);
          } else {
            setCurrentMatch(0);
            currentMatchRef.current = 0;
            setTotalMatches(0);
            console.log(`Recherche: "${query}" - aucun résultat trouvé`);
          }
        } else {
          // Si la requête est vide, efface la recherche
          updateSearchHighlightInComponent("", view);
          setCurrentMatch(0);
          currentMatchRef.current = 0;
          setTotalMatches(0);
        }
        
        // Notify about search panel being open
        if (onSearchToggle) {
          onSearchToggle(true);
        }
      },
      
      findNext: () => {
        if (editorViewRef.current) {
          return navigateToMatch(editorViewRef.current, 'next');
        }
        return null;
      },
      
      findPrevious: () => {
        if (editorViewRef.current) {
          return navigateToMatch(editorViewRef.current, 'previous');
        }
        return null;
      },
      
      getSearchInfo: () => {
        // Retourner les compteurs actuels comme SearchResult
        return {
          current: searchStateRef.current.currentMatch,
          total: searchStateRef.current.totalMatches
        };
      },
      
      isSearchOpen: () => {
        return false; // Nous utilisons l'interface dans FileContent.tsx
      },
      
      closeSearch: () => {
        // Effacer les surlignages
        if (editorViewRef.current) {
          updateSearchHighlightInComponent("", editorViewRef.current);
        }
        
        // Notifier que le panneau de recherche est fermé
        if (onSearchToggle) {
          onSearchToggle(false);
        }
      }
    };

    // Function to open the search panel
    window.openCodeMirrorSearch = () => {
      // Notify about search panel being open
      if (onSearchToggle) {
        onSearchToggle(true);
      }
    };

    return () => {
      window.cmSearchControls = undefined;
      view.destroy();
    }
  }, [element, value, filename, onSearchToggle])

  return <div ref={setElement} style={{ height }} className="overflow-auto font-mono text-sm relative">
    <style jsx global>{`
      .cm-editor {
        height: 100%;
        width: 100%;
        overflow: auto;
      }
      .cm-scroller {
        overflow: auto;
        background-color: white;
      }
      .cm-content {
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        padding: 0 8px;
        word-break: normal;
        overflow-x: auto;
        white-space: pre;
        margin-left: 8px;
      }
      
      /* Zone des numéros de ligne et flèches de pliage */
      .cm-gutters {
        position: sticky !important;
        left: 0 !important;
        z-index: 20 !important;
        background-color: #f5f5f5 !important;
        border-right: 2px solid #e0e0e0 !important;
        box-shadow: none !important; /* Suppression de l'ombre */
        padding: 0 !important;
        min-width: 36px !important; /* Réduction de la largeur minimale */
      }
      
      /* Ligne active dans la gouttière */
      .cm-activeLineGutter {
        background-color: rgba(0, 0, 0, 0.12) !important;
        color: #000 !important;
        font-weight: bold !important;
      }
      
      /* S'assurer que la ligne active prend toute la largeur */
      .cm-gutters .cm-activeLineGutter {
        width: 100% !important;
      }
      
      /* Réduire les espaces entre les éléments de gouttière */
      .cm-gutter {
        padding: 0 !important;
        margin: 0 !important;
      }
      
      /* Numéros de ligne */
      .cm-lineNumbers .cm-gutterElement {
        padding: 0 2px 0 0 !important; /* Réduction du padding à droite uniquement */
        text-align: right !important;
      }
      
      /* Flèches de pliage */
      .cm-foldGutter .cm-gutterElement {
        padding: 0 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
      }
      
      .cm-foldGutter-open, .cm-foldGutter-folded {
        cursor: pointer !important;
        font-size: 16px !important; /* Taille augmentée */
        width: 16px !important; /* Largeur augmentée */
        height: 100% !important; /* Prend toute la hauteur de la ligne */
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      .cm-foldGutter-open:after {
        content: "▼" !important;
        font-size: 10px !important; /* Taille légèrement augmentée */
        color: #555 !important;
      }
      
      .cm-foldGutter-folded:after {
        content: "►" !important;
        font-size: 10px !important; /* Taille légèrement augmentée */
        color: #555 !important;
      }
      
      /* Ligne active dans l'éditeur */
      .cm-activeLine {
        background-color: rgba(0, 0, 0, 0.07) !important;
      }
    `}</style>
  </div>
}

