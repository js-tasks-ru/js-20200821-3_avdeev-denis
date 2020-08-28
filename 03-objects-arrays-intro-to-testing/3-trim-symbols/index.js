/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size = Infinity) {
    if (!string.length || size === 0) return '';

    let sequenceSize = 1,
        current = string[0];

    let prev = current,
        result = current;

    for (let i = 1; i < string.length; i++) {
        let current = string[i];

        if (current !== prev) {
            result += current;
            sequenceSize = 1;
        } else if (sequenceSize < size) {
            result += current;
            sequenceSize++;
        }

        prev = current;
    }

    return result;
}
