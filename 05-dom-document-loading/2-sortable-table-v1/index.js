export default class SortableTable {
    element;

    ACTIVE_SORT_FIELD = ''; // ID поля, которое отсортировано в данный момент
    ACTIVE_SORT_ORDER = ''; // Порядок сортировки поля в данный момент

    constructor(header, { data }) {
        this.header = header;

        this.data = data;

        this.render();
    }

    getHTMLFromTemplate(template) {
        const parentNode = document.createElement('div');

        parentNode.innerHTML = template;

        return parentNode.firstElementChild;
    }

    getHeaderTemplate() {
        return `
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeaderTemplateData()}
            </div>
        `;
    }

    getPriceValue(price) {
        return '$' + price;
    }

    getHeaderTemplateData() {
        return this.header
            .map(({ id, title, sortable }) => {
                const isActiveCell = id === this.ACTIVE_SORT_FIELD;

                return isActiveCell ?
                    `<div class="sortable-table__cell" data-id="${id}" data-sortable="true" data-order="${this.ACTIVE_SORT_ORDER}">
                        <span>${title}</span>
                        <span data-element="arrow" class="sortable-table__sort-arrow">
                            <span class="sort-arrow"></span>
                        </span>
                    </div>` :
                    `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
                        <span>${title}</span>
                    </div>`;
            })
            .join('');
    }

    getBodyTemplate() {
        return `
            <div data-element="body" class="sortable-table__body">
                ${this.getBodyTemplateData()}
            </div>
        `;
    }

    getHeaderField(id) {
        return this.header.find(col => col.id === id);
    }

    getImageTemplate(images) {
        const imagesCol = this.getHeaderField('images');
        const templateFn = imagesCol && typeof(imagesCol.template) === 'function';

        return templateFn ? imagesCol.template(images) : '';
    }

    getBodyTemplateData() {
        return this.data
            .map((row) => {
                const { id, images, title, quantity, price, sales } = row;

                return `
                    <a href="/products/${id}" class="sortable-table__row">
                        ${this.getImageTemplate(images)}
                        ${this.getTableCellTemplate(title)}

                        ${this.getTableCellTemplate(quantity)}
                        ${this.getPriceTemplate(price)}
                        ${this.getTableCellTemplate(sales)}
                    </a>
                `;
            })
            .join('');
    }

    getPriceTemplate(price) {
        if (!price) return '';

        return `
            <div class="sortable-table__cell sortable-table__cell_type_price">${price}</div>
        `;
    }

    getTableCellTemplate(value) {
        if (!value) return '';

        return `
            <div class="sortable-table__cell">${value}</div>
        `;
    }

    getTemplate() {
        return `
            <div class="sortable-table">
                ${this.getHeaderTemplate()}
                ${this.getBodyTemplate()}
            </div>
        `;
    }

    sort(field, order) {
        // Если передали те же самые параметры сортировки - не сортируем одно и то же много раз подряд
        if (
            field === this.ACTIVE_SORT_FIELD &&
            order === this.ACTIVE_SORT_ORDER
        ) {
            return;
        }

        const sortType = this.getSortType(field);

        if (!sortType) {
            throw new Error(
                `Неправильный тип для сортировки - "${field}", возможные значения - "${this.getHeaderIds()}"
            `);
        }

        this.ACTIVE_SORT_FIELD = field;
        this.ACTIVE_SORT_ORDER = order;

        const compareFn = this.getCompareFunction(sortType, { field, order });

        if (!compareFn) return;

        const sortedData = [...this.data].sort(compareFn);

        this.data = sortedData;

        this.render();
    }


    getSortType(id) {
        const sortedCol = this.getHeaderField(id);

        if (
            !sortedCol ||
            !sortedCol.sortable
        ) return null;

        return sortedCol.sortType;
    }

    getHeaderIds() {
        return this.header.map(row => row.id).join(', ');
    }

    compareNumbersFn(a, b) {
        return a - b;
    }

    compareStringsFn(a, b) {
        return a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
    }

    getCompareFunction(sortType, { field, order = 'asc' }) {
        const direction = {
            asc: 1,
            desc: -1
        }[order];

        switch (sortType) {
            case 'string':
                return (a, b) => direction * this.compareStringsFn(a[field], b[field]);

            case 'number':
                return (a, b) => direction * this.compareNumbersFn(a[field], b[field]);

            default:
                console.error('Пока умеем сортировать только строки и числа');
                return null;
        }
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((result, subElement) => {
            result[subElement.dataset.element] = subElement;

            return result;
        }, {});
    }

    destroy() {
        this.element.remove();

        this.header = '';
        this.data = '';
    }

    render() {
        const element = this.getHTMLFromTemplate(this.getTemplate());
        const subElements = this.getSubElements(element);

        this.element = element;
        this.subElements = subElements;
    }
}

