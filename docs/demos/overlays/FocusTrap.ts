/*import { createFocus } from './Focus'
import { DOMReceiver } from 'lib/live'

export interface FocusTrap {
  containerElement: DOMReceiver
}

// https://gomakethings.com/how-to-get-the-first-and-last-focusable-elements-in-the-dom/
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function createFocusTrap() {
  const focus = createFocus(onFocusWithin)
  let container: HTMLElement | null = null

  function onFocusWithin(isWithin: boolean, event: FocusEvent) {
    if (isWithin || !container) return
    const firstFocusable = container.querySelector(FOCUSABLE_SELECTOR)
    firstFocusable && (firstFocusable as HTMLElement).focus()
    console.log('preventing default')
    event.preventDefault()
  }

  const containerElement = (newElement: HTMLElement | null): void => {
    container = newElement
    focus.targetElement(newElement)
  }

  return { containerElement }
}*/