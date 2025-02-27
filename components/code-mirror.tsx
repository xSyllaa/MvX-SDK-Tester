"use client"

import { useEffect, useState } from "react"
import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { markdown } from "@codemirror/lang-markdown"
import { json } from "@codemirror/lang-json"
import { EditorState } from "@codemirror/state"
import { oneDark } from "@codemirror/theme-one-dark"

interface CodeMirrorProps {
  value: string
  height?: string
  filename?: string
}

export function CodeMirror({ value, height = "100%", filename }: CodeMirrorProps) {
  const [element, setElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!element) return

    const extensions = [basicSetup, oneDark]

    // Add language support based on file extension
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

