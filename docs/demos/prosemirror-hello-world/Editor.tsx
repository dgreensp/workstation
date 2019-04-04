import React, { useCallback, useRef } from 'react'

import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { undo, redo, history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { Schema, DOMOutputSpecArray } from 'prosemirror-model'
import { baseKeymap } from 'prosemirror-commands'

import { useOnce } from 'lib/live/hooks'

const pDOM: DOMOutputSpecArray = ['p', 0]
const brDOM: DOMOutputSpecArray = ['br']

const nodes = {
  // :: NodeSpec The top level document node.
  doc: {
    content: 'text*',//'block+',
  },
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
      return pDOM
    },
  },
  text: {
    group: 'inline',
  },
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM() {
      return brDOM
    },
  },
}

const schema = new Schema({ nodes })

const plugins = [
  history(),
  keymap({
    'Mod-z': undo,
    'Mod-y': redo,
    'Shift-Enter': (state: EditorState, dispatch: EditorView['dispatch']) => {
      const br = schema.nodes.hard_break
      dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
      return true
    },
  }),
  keymap(baseKeymap),
]

function createEditorView(state: EditorState, dom: Node) {
  const view = new EditorView(
    { mount: dom },
    {
      state,
      dispatchTransaction(transaction: Transaction) {
        const newState = view.state.apply(transaction)
        view.updateState(newState)
        console.log(newState.doc.toJSON())
      }
    }
  )
  return view
}

export function Editor() {
  const state = useOnce(() => EditorState.create({ schema, plugins }))
  const view = useRef<EditorView>()

  const domCallback = useCallback((dom: HTMLElement | null) => {
    if (!dom) {
      if (view.current) {
        view.current.destroy()
      }
    } else {
      view.current = createEditorView(state, dom)
    }
  }, [])

  return <div className="editor form-control" ref={domCallback}></div>
}
