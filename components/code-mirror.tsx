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

  // Fonction pour trouver et compter les résultats de recherche
  const findSearchResultsInComponent = (query: string, view: EditorView): SearchResult | null => {
    if (!query || !view) return null;
    
    try {
      // Obtenir tous les résultats de recherche
      const matches: Array<{from: number, to: number}> = [];
      const doc = view.state.doc;
      
      // Recherche simple pour trouver toutes les occurrences
      let pos = 0;
      let content = doc.sliceString(0, doc.length);
      let idx = content.indexOf(query);
      
      while (idx !== -1 && pos < doc.length) {
        const from = pos + idx;
        const to = from + query.length;
        matches.push({ from, to });
        
        pos = to;
        content = doc.sliceString(pos, doc.length);
        idx = content.indexOf(query);
      }
      
      // Mettre à jour le compteur total
      searchStateRef.current.totalMatches = matches.length;
      
      // Si aucun résultat, retourner 0/0
      if (matches.length === 0) {
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
      
      // Si le curseur n'est sur aucun résultat, utiliser le premier résultat
      if (currentPos === 0 && matches.length > 0) {
        currentPos = 1;
        // Positionner le curseur sur le premier résultat
        view.dispatch({
          selection: EditorSelection.range(matches[0].from, matches[0].to)
        });
      }
      
      searchStateRef.current.currentMatch = currentPos;
      return { current: currentPos, total: matches.length };
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
        color: "#000000",                         // Default text color in black for readability
      },
      ".cm-gutters": {
        backgroundColor: "transparent",
        border: "none",
        color: "#858585"
      },
      ".cm-activeLineGutter": {
        backgroundColor: "rgba(0, 0, 0, 0.1)"
      },
      ".cm-selectionMatch": {
        backgroundColor: "rgba(181, 213, 255, 0.5)"
      },
      ".cm-line": {
        padding: "0 4px"
      },
      ".cm-activeLine": {
        backgroundColor: "rgba(0, 0, 0, 0.1)"
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
          const view = editorViewRef.current;
          // Utiliser la commande CodeMirror pour trouver le prochain résultat
          findNext(view);
          
          // Mettre à jour les informations de recherche après un court délai
          setTimeout(() => {
            const results = findSearchResultsInComponent(searchStateRef.current.lastQuery, view);
            if (results) {
              searchStateRef.current.currentMatch = results.current;
              searchStateRef.current.totalMatches = results.total;
            }
          }, 10);
          
          // Retourner les informations de recherche actuelles
          const current = searchStateRef.current.currentMatch;
          const total = searchStateRef.current.totalMatches;
          return current > 0 ? { current, total } : null;
        }
        return null;
      },
      
      findPrevious: () => {
        if (editorViewRef.current) {
          const view = editorViewRef.current;
          // Utiliser la commande CodeMirror pour trouver le résultat précédent
          findPrevious(view);
          
          // Mettre à jour les informations de recherche après un court délai
          setTimeout(() => {
            const results = findSearchResultsInComponent(searchStateRef.current.lastQuery, view);
            if (results) {
              searchStateRef.current.currentMatch = results.current;
              searchStateRef.current.totalMatches = results.total;
            }
          }, 10);
          
          // Retourner les informations de recherche actuelles
          const current = searchStateRef.current.currentMatch;
          const total = searchStateRef.current.totalMatches;
          return current > 0 ? { current, total } : null;
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

  return <div ref={setElement} style={{ height }} className="overflow-auto font-mono text-sm relative" />
}

