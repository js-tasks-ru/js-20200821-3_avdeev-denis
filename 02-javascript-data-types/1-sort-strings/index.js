/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [sortType="asc"] sortType - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

/**
 * Возможные варианты сортировки
 */
const AVALIABLE_SORT_TYPES = ['desc', 'asc'];

/**
 * Поддерживаемые языки (http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)
 */
const SUPPORTED_LANGS = ['en', 'ru'];

export function sortStrings(arr, sortType = 'asc') {
    if (!AVALIABLE_SORT_TYPES.includes(sortType)) {
        throw new Error('Неправильный тип сортировки, возможные значения ' + AVALIABLE_SORT_TYPES.join(', '));
    }

    const newArray = [].concat(arr);

    return newArray.sort((a, b) => {
        const comparedPairs = sortType === 'asc' ?
            [a, b] :
            [b, a];

        return new Intl.Collator(SUPPORTED_LANGS, { caseFirst: 'upper' }).compare(...comparedPairs);
    });
}
