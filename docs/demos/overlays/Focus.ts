import { DOMReceiver, Receiver } from 'lib/live'

export interface Focus {
  targetElement: DOMReceiver
}

// https://github.com/facebook/react/issues/6410
// https://github.com/facebook/react/issues/11405
// https://github.com/Microsoft/TSJS-lib-generator/pull/369

export function createFocus(setIsFocusWithin: (isFocusWithin: boolean, event: FocusEvent) => void): Focus {
  let element: HTMLElement | null = null

  function onFocusIn(this: HTMLElement, e: FocusEvent) {
    if (!this.contains(e.relatedTarget as Element)) {
      setIsFocusWithin(true, e)
    }
  }
  function onFocusOut(this: HTMLElement, e: FocusEvent) {
    console.log(this, e.relatedTarget)
    if (!this.contains(e.relatedTarget as Element)) {
      setIsFocusWithin(false, e)
    }
  }

  const targetElement = (newElement: HTMLElement | null) => {
    if (newElement === element) {
      return
    }
    if (element) {
      element.removeEventListener('focusin' as 'focus', onFocusIn, false)
      element.removeEventListener('focusout' as 'blur', onFocusOut, false)
    }
    element = newElement
    if (element) {
      element.addEventListener('focusin' as 'focus', onFocusIn, false)
      element.addEventListener('focusout' as 'blur', onFocusOut, false)
    }
  }
  return { targetElement }
}
