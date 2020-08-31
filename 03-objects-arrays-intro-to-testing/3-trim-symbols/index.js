/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if (!string.length || size === 0) return '';

    if (!size) {
        return string;
    }

    let sequenceSize = 1;
    let current = string[0];

    let prev = current;
    let result = current;

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
