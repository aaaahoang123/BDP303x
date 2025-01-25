
export class Checkout {
    constructor() {
        this.prices = {};
        this.total = 0;
    }

    addItemPrice(item, price) {
        this.prices[item] = price;
    }

    addItem(item) {
        if (this.prices[item] === undefined) {
            throw new Error('No price for item ' + item);
        }
        this.total += this.prices[item];
    }

    calculateTotal() {
        return this.total;
    }
}