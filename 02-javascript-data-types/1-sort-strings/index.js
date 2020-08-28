/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [sortType="asc"] sortType - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, sortType = 'asc') {
    /**
     * Возможные варианты сортировки
     */
    const AVALIABLE_SORT_TYPES = ['desc', 'asc'];

    if (!AVALIABLE_SORT_TYPES.includes(sortType)) {
        throw new Error('Неправильный тип сортировки, возможные значения ' + AVALIABLE_SORT_TYPES.join(', '));
    }

    /**
     * Поддерживаемые языки (http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry)
     */
    const SUPPORTED_LANGS = ['en', 'ru'];

    return [...arr].sort((a, b) => {
        let value1, value2;

        if (sortType === 'asc') {
            value1 = a;
            value2 = b;
        } else if (sortType === 'desc') {
            value1 = b;
            value2 = a;
        }

        return value1.localeCompare(value2, SUPPORTED_LANGS, { caseFirst: 'upper' });
    });
}
