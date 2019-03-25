import React from 'react';
import ReactDOM from 'react-dom';
import { Jumbotron, PopoverBody } from 'reactstrap';
import { createPopover } from './components/Popover';

class ParagraphWithPopover extends React.Component {
  popover = createPopover();

  render() {
    const { BoundPopover } = this.popover;
    return <>
      <p>This link has a <a ref={this.popover.referenceElement} href="#">popover</a></p>
      <BoundPopover placement="bottom">
        <PopoverBody>
          <h1>Woohoo</h1>
          <p>This is all inside the popover.</p>
        </PopoverBody>
      </BoundPopover>
    </>
  }
}

class App extends React.Component {
  render() {
    return <main role="main" className="container mt-5">
      <Jumbotron>
        <h1>Hello, Reactstrap!</h1>
        <ParagraphWithPopover />
      </Jumbotron>
    </main>
  }
}

const root = document.getElementById('root');
ReactDOM.render(<App />, root);