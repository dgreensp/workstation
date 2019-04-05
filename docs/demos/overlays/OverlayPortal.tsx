import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  ReactElement,
} from 'react'
import ReactDOM from 'react-dom'
import { useOnce, createLiveVar } from 'lib/live'
import { EventStopper } from './EventStopper'
import { createFocus } from './Focus'

// a private context used to communicate between OverlayManager and
// OverlayPortal
interface OverlayManagerContext {
  attachDiv(div: HTMLElement, level: number, exclusive?: boolean): void
  detachDiv(div: HTMLElement): void
}

const Context = createContext<OverlayManagerContext | null>(null)

export interface OverlayManagerProps {
  children?: ReactNode
}

export function OverlayManager({ children }: OverlayManagerProps) {
  const { context, containerRef, mainAppRef } = useOnce(() => {
    let container: HTMLElement | null = null
    let mainApp: HTMLElement | null = null
    /*const containerFocus = createFocus(isContainerFocused => {
      if (!mainApp) return
      if (isContainerFocused) {
        mainApp.setAttribute('aria-hidden', 'true')
      } else {
        //mainApp.removeAttribute('aria-hidden')
      }
    })*/
    const context = {
      attachDiv(div: HTMLElement, level: number, exclusive = false) {
        if (!container) return
        let divToInsertBefore = container.firstElementChild
        // try to insert the div at end of the divs with same level, for easy debugging
        // (even though we also set zIndex which should control the stacking order).
        // meanwhile, if "exclusive", detach existing divs at same level.
        while (divToInsertBefore instanceof HTMLElement) {
          const existingDiv = divToInsertBefore
          const existingDivLevel = Number(divToInsertBefore.style.zIndex)
          if (isNaN(existingDivLevel) || existingDivLevel > level) break
          divToInsertBefore = existingDiv.nextElementSibling
          if (exclusive && existingDivLevel === level) {
            container.removeChild(existingDiv)
          }
        }
        div.style.zIndex = String(level)
        container.insertBefore(div, divToInsertBefore)
      },
      detachDiv(div: HTMLElement) {
        if (div.parentNode) {
          div.parentNode.removeChild(div)
        }
      },
    }
    const containerRef = (element: HTMLElement | null) => {
      container = element
      //containerFocus.targetElement(element)
    }
    const mainAppRef = (element: HTMLElement | null) => {
      mainApp = element
    }
    return { context, containerRef, mainAppRef }
  })
  return (
    <Context.Provider value={context}>
      <div ref={mainAppRef}>{children}</div>
      <div ref={containerRef} />
    </Context.Provider>
  )
}

export interface OverlayPortalProps {
  level: number
  exclusive?: boolean
  children?: ReactNode
}
export function OverlayPortal({
  level,
  children,
  exclusive,
}: OverlayPortalProps): ReactElement {
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
    // after create the div and the portal, attach the div, and then
    // setDivAttached so that we render children.  if level changes
    // (which would be pretty unusual), the div will be detached and
    // reattached.
    context.attachDiv(div, level, exclusive)
    setDivAttached(true)
    return () => {
      context.detachDiv(div)
    }
  }, [level])
  // always create a portal, but conditionally render the children in it.
  return ReactDOM.createPortal(
    divAttached ? <EventStopper>{children}</EventStopper> : null,
    div
  )
}
