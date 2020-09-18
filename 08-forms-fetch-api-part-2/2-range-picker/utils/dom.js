/**
 * Возвращает объект subElement's внутри заданного element
 */
export const getSubElements = element => {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, subElement) => {
        result[subElement.dataset.element] = subElement;

        return result;
    }, {});
};

/**
 * Возвращает HTML из шаблона
 */
export const getHTMLNodeFromTemplate = template => {
    const parentNode = document.createElement('div');

    parentNode.innerHTML = template;

    return parentNode.firstElementChild;
};
