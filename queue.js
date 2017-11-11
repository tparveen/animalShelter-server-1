'use strict';

function createNode(data = null, next = null, prev = null) {
  return { data, next, prev };
}
class Queue {
  constructor() {
    this.first = null;
    this.last = null;
  }

  enqueue(data) {
    const node = createNode(data);
    if (this.last) {
      node.next = this.last;
      this.last.prev = node;
    }

    this.last = node;

    if (this.first === null) {
      this.first = node;
    }
  }
  dequeue() {
    if (this.first === null) {
      return;
    }
    const node = this.first;
    this.first = node.prev;

    if (node === this.last) {
      this.last = null;
    }

    return node.data;
  }
}

/**
 * Look at the top of the queue
 * @param {Queue} queue 
 */
function peek(queue) {
  /** If the top of the queue does not have anything
   * then the queue is empty
   * otherwise return what's on the top */
  if (queue.first === null) {
    return null;
  }
  return queue.first.data;
}

module.exports = { Queue, peek };
