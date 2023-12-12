// TrustKey Simple In-Memory Queue

class SimpleQueue {
  constructor() {
    this.items = [];
  }
  enqueue(item) { this.items.push(item); }
  dequeue() { return this.items.shift(); }
  size() { return this.items.length; }
}

module.exports = { SimpleQueue };
