/**
 * sum
 * @param {number} m base
 * @param {number} n index
 * @returns {number|null}
 */
export default function sum(m, n) {
    if (
        typeof(m) !== 'number' ||
        typeof(n) !== 'number'
    ) return null;

    return m + n;
}
