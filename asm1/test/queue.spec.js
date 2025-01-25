import { expect } from "chai";
import {Queue} from "../src/queue.js";

let queue;

beforeEach(() => {
    queue = new Queue();
});

it('should be defined', () => {
    expect(queue).to.an.instanceOf(Queue);
});

describe('Test with the empty queues', () => {
    it('Can call empty', () => {
        queue.empty();
    });

    it('Empty should return true', () => {
        expect(queue.empty()).to.equal(true);
    });

    it('Can call peak', () => {
        queue.peak();
    });

    it('Peak should return null', () => {
        expect(queue.peak()).to.be.null;
    });

    it('should throw when call dequeue', () => {
        expect(() => {
            queue.dequeue();
        }).to.throw();
    });

    it('Can call enqueue', () => {
        queue.enqueue(1);
    });
});

describe('Test with only one item enqueued', () => {
    const enqueuedValue = 1;
    beforeEach(() => {
        queue = new Queue();
        queue.enqueue(enqueuedValue);
    });

    it('Peak should return the enqueued value', () => {
        const val = queue.peak();
        expect(val).to.equal(enqueuedValue);
    });

    it('The queue is not empty', () => {
        expect(queue.empty()).to.false;
    });

    it('Can call dequeue', () => {
        queue.dequeue();
    });

    it('Dequeue should return the added value', () => {
        const val = queue.dequeue();
        expect(val).to.equal(enqueuedValue);
    });

    it('The queue should be empty after dequeue', () => {
        queue.dequeue();
        expect(queue.empty()).to.true;
    });
});

describe('Test with multiple steps of queue', () => {
    it('Peak should always return the first enqueue value', () => {
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);
        queue.enqueue(5);

        expect(queue.peak()).to.equal(1);
    });

    it('Peak should return the second enqueued value after dequeue, and third value after dequeue 2 times', () => {
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);
        queue.enqueue(5);

        queue.dequeue();
        expect(queue.peak()).to.equal(2);

        queue.dequeue();
        expect(queue.peak()).to.equal(3);
    });

    it('Should be empty after dequeue all items', () => {
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);
        queue.enqueue(5);
        queue.dequeue();
        queue.dequeue();
        queue.dequeue();
        queue.dequeue();
        queue.dequeue();

        expect(queue.empty()).to.true;
    });

    it('should enqueue again after dequeue all items', () => {
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);
        queue.enqueue(5);
        queue.dequeue();
        queue.dequeue();
        queue.dequeue();
        queue.dequeue();
        queue.dequeue();

        queue.enqueue(6);

        expect(queue.empty()).to.false;
        expect(queue.peak()).to.equal(6);
        expect(queue.dequeue()).to.equal(6);
    });
});




