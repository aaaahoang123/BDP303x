import { expect } from 'chai';
import {Checkout} from "../src/checkout.js";

let checkout

beforeEach(() => {
    checkout = new Checkout();
})
it('Can create an instance of Checkout class', () => {
    expect(checkout).to.be.an.instanceOf(Checkout);
});

it('Can add item price', () => {
    checkout.addItemPrice("A", 50);
});

it('Can add item', () => {
    checkout.addItemPrice('A', 50);
    checkout.addItem('A');
});

it('Can calculate the current total', () => {
    const price = 40;
    checkout.addItemPrice('A', price);
    checkout.addItem('A');
    expect(checkout.calculateTotal()).to.equal(price);
});

it('Can add multiple items add get correct total', () => {
    const items = {
        A: 50,
        B: 30,
        C: 20,
        D: 15,
    };

    Object.entries(items).forEach(([item, price]) => checkout.addItemPrice(item, price));
    Object.keys(items).forEach(item => checkout.addItem(item));

    expect(checkout.calculateTotal()).to.equal(115);
});

it('Can add multiple items of each product and get correct total', () => {
    const items = {
        A: 50,
        B: 30,
        C: 20,
        D: 15,
    };
    Object.entries(items).forEach(([item, price]) => checkout.addItemPrice(item, price));
    Object.keys(items).forEach((item, index) => {
        for (let i = 0; i < index + 1; i++) {
            checkout.addItem(item);
        }
    });

    expect(checkout.calculateTotal()).to.equal(230);
});

it('Exception is thrown when adding item without price', () => {
    expect(() => {
        checkout.addItem('A')
    }).to.throw();
});