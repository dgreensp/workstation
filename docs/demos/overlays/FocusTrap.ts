import { DOMReceiver } from 'lib/live'
import tabbable from 'tabbable'

export interface FocusTrap {
  containerElement: DOMReceiver
}

function findNextOrPrevTabbableElement(
  initial: HTMLElement,
  container: HTMLElement,
  prev: boolean
) {
  const allTabbableElements = tabbable(container)
  if (!allTabbableElements.length) {
    return initial
  }
  if (prev) {
    allTabbableElements.reverse()
  }
  const matchIndex = allTabbableElements.indexOf(initial)
  if (matchIndex >= 0) {
    return allTabbableElements[(matchIndex + 1) % allTabbableElements.length]
  }
  for (let i = 0; i < allTabbableElements.length; i++) {
    if (
      initial.compareDocumentPosition(allTabbableElements[i]) &
      (prev ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING)
    ) {
      return allTabbableElements[i]
    }
  }
  return allTabbableElements[0]
}

export function createFocusTrap() {
  let element: HTMLElement | null = null

  function onKeyDown(this: Element, e: KeyboardEvent) {
    if (e.which === 9) {
      // tab
      const initial = e.target as HTMLElement
      const container = this as HTMLElement
      const toFocus = findNextOrPrevTabbableElement(initial, container, e.shiftKey)
      toFocus.focus()
      e.preventDefault()
    }
  }

  const containerElement = (newElement: HTMLElement | null) => {
    if (newElement === element) {
      return
    }
    if (element) {
      element.removeEventListener('keydown', onKeyDown, false)
    }
    element = newElement
    if (element) {
      element.addEventListener('keydown', onKeyDown, false)
    }
  }

  return { containerElement }
}
