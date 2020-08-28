/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    function getter(obj) {
        const parts = path.split('.');

        let result = obj;

        while (parts.length) {
            const nestedItem = result[parts.shift()];

            if (!nestedItem) return;

            result = nestedItem;
        }

        return result;
    }

    return getter;
}
