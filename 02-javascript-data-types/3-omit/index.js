/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
    const fieldsObj = fields.reduce((result, current) => {
        result[current] = true;

        return result;
    }, {});

    return Object.entries(obj).reduce((result, [field, value]) => {
        if (!fieldsObj[field]) {
            result[field] = value;
        }

        return result;
    }, {});
};
