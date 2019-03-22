import React from 'react';
import ReactDOM from 'react-dom';
import { Jumbotron, Fade, PopoverBody } from 'reactstrap';
import { LiveRef, useLiveRef, useLiveRefState, DOMCallback } from 'lib/LiveRef';
import { useAllCallbacks, useComputingWrapper, usePromise, ComputingWrapper } from 'lib/hooks';
import { useHover } from 'lib/hover';
import { usePopper, PopperInner } from 'lib/popper';
import { Settings, useSettings, SettingsForm } from './settings';

function usePopoverComputeShown(forceOpen?: LiveRef<boolean>) {
  const isTargetHoveredRef = useLiveRef(false);
  const isPopoverHoveredRef = useLiveRef(false);

  const ComputeShown = useComputingWrapper(() => {
    const isTargetHovered = useLiveRefState(isTargetHoveredRef);
    const isPopoverHovered = useLiveRefState(isPopoverHoveredRef);
    const isForceOpen = forceOpen ? useLiveRefState(forceOpen): false;
    return isTargetHovered || isPopoverHovered || isForceOpen;
  });

  const result: [ComputingWrapper<boolean>, LiveRef<boolean>, LiveRef<boolean>] =
    [ComputeShown, isTargetHoveredRef, isPopoverHoveredRef];
  return result;
}

function usePopoverHoverLogic(popperTargetRef: DOMCallback, forceOpen?: LiveRef<boolean>) {
  const [ComputeShown, isTargetHoveredRef, isPopoverHoveredRef] = usePopoverComputeShown(forceOpen);
  const targetHover: DOMCallback = useHover(isTargetHoveredRef, { intent: { timeout: 1000 } });
  const targetRef: DOMCallback = useAllCallbacks(popperTargetRef, targetHover);
  const popoverRef: DOMCallback = useHover(isPopoverHoveredRef);

  const result: [ComputingWrapper<boolean>, DOMCallback, DOMCallback] =
    [ComputeShown, targetRef, popoverRef];
  return result;
}

function ParagraphWithPopover({ settings }: { settings: Settings }) {
  const showArrow = useLiveRefState(settings.showArrow);

  const [popperTargetRef, BoundPopper] = usePopper();
  const [ComputeShown, targetRef, popoverRef] = usePopoverHoverLogic(popperTargetRef, settings.forceOpen);

  return <>
    <p>This link has a <a ref={targetRef} href="#">popover</a></p>
    <ComputeShown>
      {shown =>
        <Fade in={shown} mountOnEnter unmountOnExit enter={false}>
          <BoundPopper placement="bottom" innerRef={popoverRef}>
            {args => <PopperInner args={args} showArrow={showArrow}>
              <PopoverBody>
                <h1>Woohoo</h1>
                <p>This is all inside the popover.</p>
              </PopoverBody>
            </PopperInner>
            }
          </BoundPopper>
        </Fade>
      }
    </ComputeShown>
  </>
}

function App() {
  const settings = useSettings();
  const code = usePromise(getCode);

  return <main role="main" className="container mt-5">
    <Jumbotron>
      <h1>Hello, Reactstrap!</h1>
      <ParagraphWithPopover settings={settings} />
    </Jumbotron>
    <h4>Settings:</h4>
    <SettingsForm settings={settings} />
    <h4>Code:</h4>
    <pre className="small"><code>
      {code}
    </code></pre>
  </main>
}

async function getCode(): Promise<string> {
  const response = await fetch('index.tsx');
  const text = await response.text();
  return text;
}

const root = document.getElementById('root');
ReactDOM.render(<App />, root);