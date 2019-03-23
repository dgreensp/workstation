import React from 'react';
import { Fade } from 'reactstrap';
import { createHover } from './hover';
import { createLiveRef, Listen, combineReceivers, Receiver } from './live';
import { Popper } from 'react-popper';
import * as PopperJS from "popper.js";

type PopperProps = Popper extends React.Component<infer P> ? P : never;
type PopperChildrenArgs = PopperProps['children'] extends (props: infer P) => any ? P : never;

interface PopoverInnerProps {
  args: PopperChildrenArgs
  showArrow?: boolean
  children: React.ReactNode
}

class PopoverInner extends React.Component<PopoverInnerProps> {
  render() {
    const { args, showArrow = true, children } = this.props;
    const { placement, ref, style, arrowProps } = args;
    return <div className={`popover bs-popover-${placement}`} ref={ref} style={style}>
      <div className="popover-inner" role="tooltip" aria-hidden="true">
        {children}
      </div>
      {showArrow && <div className="arrow" ref={arrowProps.ref} style={arrowProps.style} />}
    </div>
  }
}

export interface Popover {
  targetRef: Receiver<HTMLElement | null>
  BoundPopover: (props: BoundPopoverProps) => React.ReactElement
}

export interface BoundPopoverProps {
  placement: PopperJS.Placement
  children: React.ReactNode
  showArrow?: boolean
  forceOpen?: boolean
}

export function createPopover(): Popover {
  const isTargetHovered = createLiveRef(false);
  const targetHover = createHover(isTargetHovered, { intent: { timeout: 1000 } });
  const isPopoverHovered = createLiveRef(false);
  const popoverHover = createHover(isPopoverHovered);

  const target = createLiveRef<HTMLElement | null>(null)
  const targetWithHover = combineReceivers(target, targetHover.targetReceiver);

  return {
    targetRef: targetWithHover,
    BoundPopover: ({
      showArrow = true,
      forceOpen = false,
      placement,
      children,
    }) => <Listen to={{ isTargetHovered, isPopoverHovered, target }}>
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
                {args => <PopoverInner args={args} showArrow={showArrow}>
                  {children}
                </PopoverInner>
                }
              </Popper>
            </Fade>
          }
        }
      </Listen>,
  }
}