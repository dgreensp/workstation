import { Listenable } from './Listenable'
import { Receiver } from './Receiver'

export interface LiveVar<V> extends Listenable<V>, Receiver<V> {}

export function createLiveVar<V>(initialValue: V): LiveVar<V> {
  const receivers = new Set<Receiver<V>>();
  let currentValue = initialValue;
  const LiveVar = (newValue: V) => {
    currentValue = newValue;
    receivers.forEach(r => r(newValue));
  }
  LiveVar.listen = (receiver: Receiver<V>) => void receivers.add(receiver);
  LiveVar.unlisten = (receiver: Receiver<V>) => void receivers.delete(receiver);
  LiveVar.peek = () => currentValue;
  return LiveVar;
}

export type LiveDOMVar = LiveVar<HTMLElement | null>
export const createLiveDOMVar = (initialValue: HTMLElement | null = null) => createLiveVar(initialValue);
