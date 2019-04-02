export type Receiver<V> = (newValue: V) => void

export function combineReceivers<V>(...receivers: Receiver<V>[]): Receiver<V> {
  return (newValue: V) => {
    receivers.forEach(r => r(newValue));
  }
}

export type DOMReceiver = Receiver<HTMLElement | null>
