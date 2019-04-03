import React from 'react';
import ReactDOM from 'react-dom';
import { Alert } from 'reactstrap';

import { Editor } from './Editor'

function App() {
  return <main role="main" className="container mt-5">
    <h1>Hello, Reactstrap!</h1>
    <Editor/>
  </main>
}

const root = document.getElementById('root');
ReactDOM.render(<App />, root);
