"use client"

import { useEffect, useState } from "react"
import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { markdown } from "@codemirror/lang-markdown"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { EditorState } from "@codemirror/state"
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language"

interface CodeMirrorProps {
  value: string
  height?: string
  filename?: string
}

export function CodeMirror({ value, height = "100%", filename }: CodeMirrorProps) {
  const [element, setElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!element) return

    // Cursor-like theme with additional customizations
    const cursorTheme = EditorView.theme({
      "&": {
        fontSize: "13px",
        backgroundColor: "transparent"
      },
      ".cm-content": {
        caretColor: "#5cadff",
        fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace"
      },
      ".cm-gutters": {
        backgroundColor: "transparent",
        border: "none",
        color: "#8a91a7"
      },
      ".cm-activeLineGutter": {
        backgroundColor: "rgba(99, 114, 136, 0.08)"
      },
      ".cm-selectionMatch": {
        backgroundColor: "rgba(145, 170, 200, 0.3)"
      },
      ".cm-line": {
        padding: "0 4px"
      },
      ".cm-activeLine": {
        backgroundColor: "rgba(99, 114, 136, 0.08)"
      },
      "&.cm-focused .cm-cursor": {
        borderLeftWidth: "2px",
        borderLeftColor: "#5cadff"
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
        backgroundColor: "rgba(56, 139, 253, 0.15)"
      },
      ".cm-keyword": { color: "#d73a49" },
      ".cm-property": { color: "#005cc5" },
      ".cm-comment": { color: "#6a737d" },
      ".cm-string": { color: "#032f62" },
      ".cm-number": { color: "#005cc5" },
      ".cm-atom": { color: "#e36209" },
      ".cm-variableName": { color: "#24292e" },
      ".cm-typeName": { color: "#005cc5" },
      ".cm-className": { color: "#6f42c1" },
      ".cm-definition": { color: "#6f42c1" },
    });

    // Configuration de base avec options supplémentaires
    const extensions = [
      basicSetup, 
      cursorTheme,
      syntaxHighlighting(defaultHighlightStyle),
      EditorView.editable.of(false), // Mode lecture seule
      EditorState.readOnly.of(true)  // Double sécurité pour lecture seule
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
        // Nous utilisons javascript() comme fallback pour les autres extensions
        default:
          // Pour les autres langages, utiliser un traitement de base
          extensions.push(javascript())
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

    return () => {
      view.destroy()
    }
  }, [element, value, filename])

  return <div ref={setElement} style={{ height }} className="overflow-auto font-mono text-sm" />
}

