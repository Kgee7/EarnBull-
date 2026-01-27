import { EventEmitter } from 'events';

// Since we're in a single-threaded environment, a simple event emitter is sufficient.
// We are using the node one, but a custom one could be implemented as well.
export const errorEmitter = new EventEmitter();
