import React, { createContext, useContext, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useOnce, DOMReceiver } from 'lib/live'

// a private context used to communicate between OverlayManager and
// createOverlay(...).Portal
interface OverlayManagerContext {
  attachDiv(div: HTMLElement, level: number): void
  detachDiv(div: HTMLElement): void
}

const Context = createContext<OverlayManagerContext | null>(null)

export interface OverlayManagerProps {
  children: React.ReactNode
}

export function OverlayManager({ children }: OverlayManagerProps) {
  const { context, containerRef } = useOnce(() => {
    let container: HTMLElement | null = null
    const context = {
      attachDiv(div: HTMLElement, level: number) {
        if (!container) return
        let nextSibling = container.firstElementChild
        // try to insert the div at end of the divs with same level, for easy debugging
        // (even though we also set zIndex which should control the stacking order)
        while (
          nextSibling instanceof HTMLElement &&
          Number(nextSibling.style.zIndex) <= level
        ) {
          nextSibling = nextSibling.nextElementSibling
        }
        div.style.zIndex = String(level)
        container.insertBefore(div, nextSibling)
      },
      detachDiv(div: HTMLElement) {
        if (div.parentNode) {
          div.parentNode.removeChild(div)
        }
      },
    }
    const containerRef = (element: HTMLElement | null) => {
      container = element
    }
    return { context, containerRef }
  })
  return (
    <Context.Provider value={context}>
      {children}
      <div ref={containerRef} />
    </Context.Provider>
  )
}

export interface OverlayPortalProps {
  children: React.ReactNode
}

export interface Overlay {
  Portal: (props: OverlayPortalProps) => React.ReactElement
}

export function createOverlay(level: number): Overlay {
  function Portal({ children }: OverlayPortalProps): React.ReactElement {
    // create a single div at first render to use for the portal.
    // we can't actually put it in the DOM, because rendering should
    // not have side effects, especially ones that require cleanup.
    const div = useOnce(() => document.createElement('div'))
    // use a state variable to not render children until div is attached.
    // we want to avoid confusing the children, which will probably want
    // to assume they are attached after they are rendered.
    const [divAttached, setDivAttached] = useState(false)
    const context = useContext(Context)
    if (!context) {
      console.warn('createOverlay used without an enclosing OverlayManager')
      return <></>
    }
    useEffect(() => {
      // this effect only runs once, it's like a componentDidMount.
      // we attach the div and set our state variable.
      context.attachDiv(div, level)
      setDivAttached(true)
      return () => {
        context.detachDiv(div)
      }
    }, [])
    // always create a portal, but conditionally render the children in it.
    return ReactDOM.createPortal(divAttached ? children : null, div)
  }
  return { Portal }
}

// note that level is not reactive
export function useOverlay(level: number): Overlay {
  return useOnce(() => createOverlay(level))
}
