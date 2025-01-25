class LinkedList {
    constructor(val, next) {
        this.val = val;
        this.next = next ?? null;
    }
}


export class Queue {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    empty() {
        return !this.head;
    }

    enqueue(value) {
        const newNode = new LinkedList(value);
        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
    }

    peak() {
        return this.head?.val ?? null;
    }

    dequeue() {
        if (this.empty()) {
            throw new Error('The queue is empty, can not dequeue');
        }
        const val = this.peak();

        this.head = this.head.next;

        return val;
    }
}