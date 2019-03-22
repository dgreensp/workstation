import React from 'react';
import ReactDOM, { render } from 'react-dom';
import { Jumbotron, Fade, PopoverBody } from 'reactstrap';
import { getHoverRef } from 'lib/hover';
import { createSettings, SettingsForm, Settings } from './settings';
import { LiveRef, createLiveRef, Listen, combineReceivers, Receiver } from 'lib/live';
import { Popper } from 'react-popper';

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

interface ParagraphWithPopoverProps {
  settings: Settings
}

class ParagraphWithPopover extends React.Component<ParagraphWithPopoverProps> {
  popoverTarget: LiveRef<HTMLElement | null>
  isTargetHovered: LiveRef<boolean>
  popoverTargetWithHover: Receiver<HTMLElement | null>
  popover: LiveRef<HTMLElement | null>
  isPopoverHovered: LiveRef<boolean>
  popoverWithHover: Receiver<HTMLElement | null>

  constructor(props: ParagraphWithPopoverProps) {
    super(props);
    this.popoverTarget = createLiveRef<HTMLElement | null>(null)
    this.isTargetHovered = createLiveRef(false)
    this.popoverTargetWithHover = combineReceivers(
      this.popoverTarget,
      getHoverRef(this.isTargetHovered, { intent: { timeout: 1000 } }))
    this.popover = createLiveRef<HTMLElement | null>(null)
    this.isPopoverHovered = createLiveRef(false);
    this.popoverWithHover = getHoverRef(this.isPopoverHovered);
  }

  render() {
    return <>
      <p>This link has a <a ref={this.popoverTargetWithHover} href="#">popover</a></p>
      <Listen to={{
        isTargetHovered: this.isTargetHovered,
        isPopoverHovered: this.isPopoverHovered,
        popoverTarget: this.popoverTarget,
        forceOpen: this.props.settings.forceOpen,
        showArrow: this.props.settings.showArrow,
      }}>
        {
          ({ isTargetHovered, isPopoverHovered, popoverTarget, forceOpen, showArrow }) => {
            const shown = isTargetHovered || isPopoverHovered || forceOpen;
            return <Fade in={shown} mountOnEnter unmountOnExit enter={false}>
              <Popper
                referenceElement={popoverTarget || undefined}
                placement="bottom"
                innerRef={this.popoverWithHover}
                key={String(showArrow)}
              >
                {args => <PopoverInner args={args} showArrow={showArrow}>
                  <PopoverBody>
                    <h1>Woohoo</h1>
                    <p>This is all inside the popover.</p>
                  </PopoverBody>
                </PopoverInner>
                }
              </Popper>
            </Fade>
          }
        }
      </Listen>
    </>
  }
}

class App extends React.Component {
  settings = createSettings()

  render() {
    return <main role="main" className="container mt-5">
      <Jumbotron>
        <h1>Hello, Reactstrap!</h1>
        <ParagraphWithPopover settings={this.settings} />
      </Jumbotron>
      <h4>Settings:</h4>
      <SettingsForm settings={this.settings} />
    </main>
  }
}

const root = document.getElementById('root');
ReactDOM.render(<App />, root);