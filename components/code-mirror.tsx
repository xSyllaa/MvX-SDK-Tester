"use client"

import { useEffect, useState, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { markdown } from "@codemirror/lang-markdown"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { EditorState } from "@codemirror/state"
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language"
import { tags } from "@lezer/highlight"
import { search, searchKeymap } from "@codemirror/search"
import { keymap } from "@codemirror/view"

// Ajout de la déclaration globale pour TypeScript
declare global {
  interface Window {
    openCodeMirrorSearch: () => void;
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

  useEffect(() => {
    if (!element) return

    // Thème personnalisé qui correspond mieux à Cursor avec des couleurs plus lisibles
    const cursorHighlightStyle = HighlightStyle.define([
      { tag: tags.keyword, color: "#0000ff" },        // Bleu pour les mots-clés (import, from, function, const...)
      { tag: tags.operator, color: "#000000" },       // Noir pour les opérateurs pour plus de lisibilité
      { tag: tags.string, color: "#a31515" },         // Rouge foncé pour les strings
      { tag: tags.function(tags.variableName), color: "#795E26" }, // Brun/or pour les fonctions
      { tag: tags.comment, color: "#008000" },        // Vert vif pour les commentaires
      { tag: tags.number, color: "#098658" },         // Vert foncé pour les nombres
      { tag: tags.bool, color: "#0000ff" },           // Bleu pour les booléens
      { tag: tags.className, color: "#267f99" },      // Bleu-vert foncé pour les classes (plus lisible)
      { tag: tags.definition(tags.variableName), color: "#001080" }, // Bleu foncé pour les définitions de variables
      { tag: tags.propertyName, color: "#001080" },   // Bleu foncé pour les propriétés
      { tag: tags.typeName, color: "#267f99" },       // Bleu-vert foncé pour les types
      { tag: tags.variableName, color: "#001080" },   // Bleu foncé pour les variables
      { tag: tags.attributeName, color: "#ff0000" },  // Rouge pour les attributs
      { tag: tags.heading, color: "#0000ff", fontWeight: "bold" },
      { tag: tags.content, color: "#000000" },        // Texte général en noir pour lisibilité
      { tag: tags.meta, color: "#000000" },           // Meta infos en noir
    ])

    // Thème pour l'interface en mode clair
    const cursorTheme = EditorView.theme({
      "&": {
        fontSize: "13px",
        backgroundColor: "transparent"
      },
      ".cm-content": {
        caretColor: "#5cadff",
        fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
        color: "#000000",                         // Couleur de texte par défaut en noir pour lisibilité
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
      ".cm-searchMatch": {
        backgroundColor: "rgba(255, 235, 0, 0.3)",
        outline: "1px solid rgba(255, 235, 0, 0.5)"
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "rgba(255, 235, 0, 0.5)"
      },
      // Styles pour la barre de recherche en style Cursor
      ".cm-panel.cm-search": {
        backgroundColor: "#f3f3f3",
        color: "#333333",
        border: "1px solid #ddd",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
        padding: "2px 8px",
        borderRadius: "3px",
        display: "flex",
        alignItems: "center",
      },
      ".cm-panel.cm-search input": {
        backgroundColor: "#ffffff",
        color: "#333333",
        border: "1px solid #ccc",
        outline: "none",
        height: "24px",
        padding: "0 6px",
        borderRadius: "3px",
        marginRight: "4px",
      },
      ".cm-panel.cm-search button": {
        backgroundColor: "transparent",
        color: "#555555",
        border: "none",
        cursor: "pointer",
        padding: "2px 6px",
        borderRadius: "3px",
      },
      ".cm-panel.cm-search button:hover": {
        backgroundColor: "#e5e5e5",
      },
      ".cm-panel.cm-search .cm-button": {
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer", 
        height: "24px",
        padding: "0 6px",
        color: "#555555",
        borderRadius: "3px",
      },
      ".cm-panel.cm-search .cm-button:hover": {
        backgroundColor: "#e5e5e5",
      },
      ".cm-panel.cm-search .cm-textfield": {
        backgroundColor: "#ffffff",
        color: "#333333", 
        border: "1px solid #ccc",
        height: "24px",
        padding: "0 6px",
        borderRadius: "3px",
      },
      ".cm-panel.cm-search label": {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: "#555555",
        marginLeft: "4px",
      },
      ".cm-panel.cm-search .cm-search-info": {
        color: "#555555",
        marginLeft: "6px",
        fontSize: "12px",
      }
    });

    // Thème sombre pour l'interface
    const darkTheme = EditorView.theme({
      // Styles pour le mode sombre
      "&": {
        backgroundColor: "transparent"
      },
      ".cm-content": {
        color: "#d4d4d4",
      },
      ".cm-gutters": {
        backgroundColor: "transparent",
        border: "none",
        color: "#858585" 
      },
      // Styles pour la barre de recherche en mode sombre
      ".cm-panel.cm-search": {
        backgroundColor: "#2d2d2d",
        color: "#cccccc",
      },
      ".cm-panel.cm-search input": {
        backgroundColor: "#3c3c3c",
        color: "#cccccc",
        border: "1px solid #1e1e1e",
      },
    }, { dark: true });

    // Configuration de base avec options supplémentaires
    const extensions = [
      basicSetup, 
      cursorTheme,
      darkTheme,
      syntaxHighlighting(cursorHighlightStyle),
      EditorView.editable.of(false), // Mode lecture seule
      EditorState.readOnly.of(true), // Double sécurité pour lecture seule
      search({
        top: true, 
        caseSensitive: false
      }),
      keymap.of(searchKeymap), // Ajouter les raccourcis de recherche
      EditorView.domEventHandlers({
        // Bloquer les raccourcis clavier qui pourraient modifier le contenu
        keydown: (event) => {
          // Permettre les raccourcis de recherche (Ctrl+F)
          if (event.key === "f" && (event.ctrlKey || event.metaKey)) {
            return false;
          }
          // Bloquer les raccourcis pouvant modifier le texte
          if (event.key === "x" && (event.ctrlKey || event.metaKey)) {
            return true;
          }
          return false;
        }
      })
    ]

    // Support de langage basé sur l'extension du fichier
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
        case "py":  // Support basique pour Python
          extensions.push(javascript({ jsx: false, typescript: false }))
          break
        // Fallback pour les autres extensions
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

    // Après la création de la vue, on peut personnaliser certains éléments de l'interface
    // notamment la barre de recherche quand elle apparaît
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement && node.classList.contains('cm-search')) {
              // Personnaliser l'interface de recherche si nécessaire
              const searchPanel = node as HTMLElement;
              // Ajouter une classe pour styliser avec CSS si besoin
              searchPanel.classList.add('custom-search-panel');
              
              // Ajouter des icônes personnalisées similaires à Cursor
              // Rechercher et remplacer des boutons existants par des versions avec icônes
              const buttons = searchPanel.querySelectorAll('button');
              buttons.forEach(button => {
                if (button.textContent === 'Find' || button.textContent === 'Aa' || 
                    button.textContent === '.*' || button.textContent === '↑' || 
                    button.textContent === '↓' || button.textContent === '×') {
                  button.classList.add('cursor-icon-btn');
                }
                
                // Remplacer le texte des boutons par des icônes
                if (button.textContent === '↑') {
                  button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 4L3 9H13L8 4Z" fill="currentColor"/>
                  </svg>`;
                  button.title = "Previous match";
                } else if (button.textContent === '↓') {
                  button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 12L13 7H3L8 12Z" fill="currentColor"/>
                  </svg>`;
                  button.title = "Next match";
                } else if (button.textContent === '×') {
                  button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5"/>
                  </svg>`;
                  button.title = "Close";
                }
              });
            }
          });
        }
      });
    });

    // Surveiller les changements dans le DOM pour détecter l'apparition du panneau de recherche
    observer.observe(element, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      view.destroy();
    }
  }, [element, value, filename])

  // Fonction pour ouvrir la recherche
  const openSearch = () => {
    if (editorViewRef.current) {
      // Simuler un Ctrl+F pour ouvrir la recherche
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        code: 'KeyF',
        ctrlKey: true,
        bubbles: true
      });
      if (editorViewRef.current.contentDOM) {
        editorViewRef.current.contentDOM.dispatchEvent(event);
        if (onSearchToggle) onSearchToggle(true);
      }
    }
  }

  // Exposer la fonction de recherche
  if (typeof window !== 'undefined') {
    window.openCodeMirrorSearch = openSearch;
  }

  return (
    <>
      <style jsx global>{`
        /* Styles globaux pour la barre de recherche */
        .custom-search-panel {
          display: flex !important;
          align-items: center !important;
          background-color: #f3f3f3 !important;
          color: #333333 !important;
          padding: 2px 8px !important;
          border: 1px solid #ddd !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
          border-radius: 3px !important;
        }
        
        .custom-search-panel button {
          background: transparent !important;
          border: none !important;
          color: #555555 !important;
          padding: 2px 6px !important;
          margin: 0 2px !important;
          cursor: pointer !important;
          border-radius: 3px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .custom-search-panel button:hover {
          background-color: #e5e5e5 !important;
        }
        
        .custom-search-panel input {
          background-color: #ffffff !important;
          color: #333333 !important;
          border: 1px solid #ccc !important;
          padding: 4px 8px !important;
          margin: 0 4px !important;
          border-radius: 3px !important;
          height: 24px !important;
        }
        
        /* Style spécifique pour le compteur de résultats */
        .cm-search-count {
          margin: 0 8px !important;
          font-size: 12px !important;
          color: #555555 !important;
        }
        
        /* Style pour les boutons avec icônes */
        .cursor-icon-btn {
          width: 24px !important;
          height: 24px !important;
          min-width: 24px !important;
          padding: 0 !important;
        }
        
        /* Style pour la partie "2 of 6" */
        .cm-panel.cm-search span {
          color: #555555 !important;
          font-size: 12px !important;
          margin: 0 4px !important;
        }
        
        /* Style pour le texte "Find" */
        .cm-panel.cm-search label {
          display: none !important; /* Cacher le texte "Find" pour ressembler plus à Cursor */
        }
        
        /* Ajustements pour le mode sombre */
        .dark .custom-search-panel {
          background-color: #2d2d2d !important;
          color: #cccccc !important;
          border-color: #1e1e1e !important;
        }
        
        .dark .custom-search-panel button {
          color: #cccccc !important;
        }
        
        .dark .custom-search-panel button:hover {
          background-color: #3c3c3c !important;
        }
        
        .dark .custom-search-panel input {
          background-color: #3c3c3c !important;
          color: #cccccc !important;
          border-color: #1e1e1e !important;
        }
        
        .dark .cm-search-count,
        .dark .cm-panel.cm-search span {
          color: #cccccc !important;
        }
      `}</style>
      <div ref={setElement} style={{ height }} className="overflow-auto font-mono text-sm" />
    </>
  )
}

