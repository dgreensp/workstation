import React from 'react'
import { Popper } from 'react-popper'
import { DOMCallback, useLiveRef, useLiveRefState } from 'lib/LiveRef';

type PopperProps = Popper extends React.Component<infer P> ? P : never;
type PopperChildrenArgs = PopperProps['children'] extends (props: infer P) => any ? P : never;

export function usePopper(): [DOMCallback, (props: PopperProps) => React.ReactElement] {
  const targetRef = useLiveRef<HTMLElement | null>(null);
  function BoundPopper(props: PopperProps): React.ReactElement {
    const referenceElement = useLiveRefState(targetRef) || undefined;
    return <Popper {...{ referenceElement, ...props }} />
  }
  return [targetRef, BoundPopper];
}

interface PopperInnerProps {
  args: PopperChildrenArgs
  showArrow?: boolean
  children: React.ReactNode
}

export function PopperInner(props: PopperInnerProps): React.ReactElement {
  const { args, showArrow = true, children } = props;
  const { placement, ref, style, arrowProps } = args;
  return <div className={`popover bs-popover-${placement}`} ref={ref} style={style}>
    <div className="popover-inner" role="tooltip" aria-hidden="true">
      {children}
    </div>
    {showArrow && <div className="arrow" ref={arrowProps.ref} style={arrowProps.style} />}
  </div>
}