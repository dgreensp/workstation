import React from 'react';
import ReactDOM from 'react-dom';
import { Fade, PopoverBody } from 'reactstrap';
import { LiveRef, useLiveRef, useLiveRefState, DOMCallback } from 'lib/LiveRef';
import { useAllCallbacks, useComputingWrapper } from 'lib/hooks';
import { useHover } from 'lib/hover';
import { usePopper, PopperInner } from 'lib/popper';

function App() {
  const [popperTargetRef, BoundPopper] = usePopper();
  const targetHovered: LiveRef<boolean> = useLiveRef(false);
  const targetHover: DOMCallback = useHover(targetHovered, { intent: { timeout: 1000 } });
  const popoverHovered: LiveRef<boolean> = useLiveRef(false);
  const popoverHover: DOMCallback = useHover(popoverHovered);
  const targetRef: DOMCallback = useAllCallbacks(popperTargetRef, targetHover);

  const ComputeShown = useComputingWrapper(() => {
    const isTargetHovered = useLiveRefState(targetHovered);
    const isPopoverHovered = useLiveRefState(popoverHovered);
    return isTargetHovered || isPopoverHovered;
  });
  
  return <>
    <main role="main" className="container mt-5">
      <h1>Hello, Reactstrap!</h1>
      <p>This link has a <a ref={targetRef} href="#">popover</a></p>
    </main>
    <ComputeShown>
      {shown =>
        <Fade in={shown} mountOnEnter unmountOnExit enter={false}>
          <BoundPopper placement="bottom" innerRef={popoverHover}>
            {args => <PopperInner args={args} showArrow={false}>
              <PopoverBody>
                <h1>Woohoo</h1>
              </PopoverBody>
            </PopperInner>
            }
          </BoundPopper>
        </Fade>
      }
    </ComputeShown>
  </>
}

const root = document.getElementById('root');
ReactDOM.render(<App />, root);