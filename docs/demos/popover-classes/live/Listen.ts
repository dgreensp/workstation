import React from 'react'
import { Listenable } from './Listenable'
import { Receiver } from './Receiver'

export interface ListenProps<O> {
  to: { [K in keyof O]: Listenable<O[K]> }
  children: (props: O) => React.ReactNode
}

export class Listen<O> extends React.Component<ListenProps<O>, O> {
  receivers: { [K in keyof O]: Receiver<O[K]> } = {} as any

  constructor(props: ListenProps<O>) {
    super(props);
    const initialState: O = {} as any;
    const { to: listenables } = props;
    // calculate initial state and create receivers
    for (const key in listenables) {
      initialState[key] = listenables[key].peek();
      this.receivers[key] = (newValue: O[typeof key]) => {
        this.setState(state => ({ ...state, [key]: newValue }));
      }
    }
    this.state = initialState;
  }

  componentDidMount() {
    const { to: listenables } = this.props;
    // update all receivers and listen to future changes
    for (const key in listenables) {
      const listenable = listenables[key];
      const receiver = this.receivers[key];
      receiver(listenable.peek());
      listenable.listen(receiver);
    }
  }

  componentDidUpdate(prevProps: ListenProps<O>) {
    const { to: oldListenables } = prevProps;
    const { to: newListenables } = this.props;
    // unlisten and relisten for each listener that changed.
    // keys should be the same in oldListenables and newListenables
    for (const key in newListenables) {
      const oldListenable = oldListenables[key];
      const newListenable = newListenables[key];
      if (oldListenable !== newListenable) {
        const receiver = this.receivers[key];
        oldListenable.unlisten(receiver);
        receiver(newListenable.peek());
        newListenable.listen(receiver);
      }
    }
  }

  componentWillUnmount() {
    const { to: listenables } = this.props;
    // unlisten
    for (const key in listenables) {
      listenables[key].unlisten(this.receivers[key]);
    }
  }

  render() {
    return this.props.children(this.state);
  }
}