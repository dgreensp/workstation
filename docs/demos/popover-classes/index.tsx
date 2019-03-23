import React from 'react';
import ReactDOM from 'react-dom';
import { Jumbotron, PopoverBody } from 'reactstrap';
import { createSettings, SettingsForm, Settings } from './settings';
import { Listen } from './live';
import { createPopover } from './Popover';

interface ParagraphWithPopoverProps {
  settings: Settings
}

class ParagraphWithPopover extends React.Component<ParagraphWithPopoverProps> {
  popover = createPopover();

  render() {
    const { BoundPopover } = this.popover;
    return <>
      <p>This link has a <a ref={this.popover.targetRef} href="#">popover</a></p>
      <Listen to={{
        forceOpen: this.props.settings.forceOpen,
        showArrow: this.props.settings.showArrow,
      }}>
        {
          ({ forceOpen, showArrow }) => <BoundPopover
            forceOpen={forceOpen}
            showArrow={showArrow}
            placement="bottom"
          >
            <PopoverBody>
              <h1>Woohoo</h1>
              <p>This is all inside the popover.</p>
            </PopoverBody>
          </BoundPopover>
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