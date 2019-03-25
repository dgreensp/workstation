import { Receiver } from './Receiver';

export interface Listenable<V> {
  listen(receiver: Receiver<V>): void
  unlisten(receiver: Receiver<V>): void
  peek(): V
}

export type DOMListenable = Listenable<HTMLElement | null>
