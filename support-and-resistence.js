export function findSupportResistance(prices, n = 12) {
    if (!Array.isArray(prices) || !prices.every(p => typeof p === 'number')) {
        throw new TypeError("prices must be an array of numbers.");
    }
    if (prices.length === 0) {
        return [[], []];
    }
    if (!Number.isInteger(n) || n < 1) {
        throw new ValueError("n (window parameter) must be an integer >= 1.");
    }

    const supports = [];
    const resistances = [];

    if (prices.length < 2 * n + 1) {
        return [[], []];
    }

    for (let i = n; i < prices.length - n; i++) {
        const window = prices.slice(i - n, i + n + 1);
        const currentPrice = prices[i];

        if (currentPrice === Math.min(...window)) {
            if (prices[i - 1] > currentPrice) {
                supports.push([i, currentPrice]);
            }
        }

        if (currentPrice === Math.max(...window)) {
            if (prices[i - 1] < currentPrice) {
                resistances.push([i, currentPrice]);
            }
        }
    }
    return [supports, resistances];
}
