import React, { ReactElement, ReactNode } from 'react'
import { DOMReceiver, useListen, createLiveVar } from 'lib/live'
import { createHover, HoverOptions } from 'lib/Hover'
import { OverlayPortal } from './OverlayPortal'

export interface HoverPopover {
  triggerElement: DOMReceiver
  (props: HoverPopoverProps): ReactElement
}

export interface HoverPopoverProps {
  children: ReactNode
}

const HOVER_POPOVER_LEVEL = 1000

export function createHoverPopover(options?: HoverOptions): HoverPopover {
  const shown = createLiveVar(false)
  const triggerHover = createHover(onTriggerHovered, options)
  function onTriggerHovered(isHovered: boolean) {
    shown(isHovered)
  }

  function HoverPopover({ children }: HoverPopoverProps) {
    return useListen(shown) ? (
      <OverlayPortal level={HOVER_POPOVER_LEVEL} exclusive>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>{children}</div>
      </OverlayPortal>
    ) : (
      <></>
    )
  }
  HoverPopover.triggerElement = triggerHover.targetElement
  return HoverPopover
}
