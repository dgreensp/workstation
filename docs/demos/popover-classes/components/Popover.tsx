import React from 'react';
import { Fade } from 'reactstrap';
import { createListenableHover } from './ListenableHover';
import { Listen, combineReceivers, DOMReceiver, createLiveDOMVar } from '../live';
import { Popper } from 'react-popper';
import * as PopperJS from "popper.js";

export interface Popover {
  targetRef: DOMReceiver
  BoundPopover: (props: BoundPopoverProps) => React.ReactElement
}

export interface BoundPopoverProps {
  placement: PopperJS.Placement
  children: React.ReactNode
  showArrow?: boolean
  forceOpen?: boolean
}

export function createPopover(): Popover {
  const targetHover = createListenableHover({ intent: { timeout: 1000 } });
  const popoverHover = createListenableHover({ intent: false });
  const target = createLiveDOMVar()
  const targetWithHover = combineReceivers(target, targetHover.targetReceiver);

  return {
    targetRef: targetWithHover,
    BoundPopover: ({
      showArrow = true,
      forceOpen = false,
      placement,
      children,
    }) => <Listen to={{ isTargetHovered: targetHover.isHovered, isPopoverHovered: popoverHover.isHovered, target }}>
        {
          ({ isTargetHovered, isPopoverHovered, target }) => {
            const shown = isTargetHovered || isPopoverHovered || forceOpen;
            return <Fade in={shown} mountOnEnter unmountOnExit enter={false}>
              <Popper
                referenceElement={target || undefined}
                placement={placement}
                innerRef={popoverHover.targetReceiver}
                key={String(showArrow)}
              >
                {({ ref, style, arrowProps }) =>
                  // Attach Popover's refs and styles, and apply Bootstrap classes.
                  // The caller is expected to nest popover-header and/or popover-body inside.
                  // TODO: perhaps provide a way to customize the style, such as by
                  // adding extra classNames.
                  <div className={`popover bs-popover-${placement}`} ref={ref} style={style}>
                    <div className="popover-inner" role="tooltip" aria-hidden="true">
                      {children}
                    </div>
                    {showArrow && <div className="arrow" ref={arrowProps.ref} style={arrowProps.style} />}
                  </div>
                }
              </Popper>
            </Fade>
          }
        }
      </Listen>,
  }
}