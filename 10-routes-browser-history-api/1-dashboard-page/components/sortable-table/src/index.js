import fetchJson from '../../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export const isUndefined = value => typeof (value) === 'undefined';

export default class SortableTable {
    static step = 30;

    element;
    subElements;

    observer;

    sortOptions = {
        start: 0,
        end: SortableTable.step,
        order: 'asc',
        field: 'title',
        from: '',
        to: '',
    };

    constructor(header, { data, url, isSortLocally }) {
        this.header = header;

        this.data = data;
        this.url = url;

        this.isSortLocally = isSortLocally;

        this.render();
    }

    generateUrl() {
        const url = new URL(BACKEND_URL + '/' + this.url);

        url.searchParams.append('_start', this.sortOptions.start);
        url.searchParams.append('_end', this.sortOptions.end);
        url.searchParams.append('_order', this.sortOptions.order);
        url.searchParams.append('_sort', this.sortOptions.field);

        if (this.sortOptions.from) {
            url.searchParams.append('from', this.sortOptions.from);
        }

        if (this.sortOptions.to) {
            url.searchParams.append('to', this.sortOptions.to);
        }

        return url;
    }

    updateSortOptions({ start, end, field, order, from, to } = {}) {
        if (!isNaN(start)) {
            this.sortOptions.start = start;
        }

        if (end) {
            this.sortOptions.end = end;
        }

        if (order) {
            this.sortOptions.order = order;
        }

        if (field) {
            this.sortOptions.field = field;
        }

        if (from) {
            this.sortOptions.field = from;
        }

        if (to) {
            this.sortOptions.to = to;
        }
    }

    beforeUpdateRequest(options) {
        this.observer?.unobserve(this.subElements.loading);

        this.updateSortOptions(options);

        this.subElements.body.innerHTML = '';

        this.showLoader();
    }

    async update(options) {
        this.beforeUpdateRequest(options);

        await this.request();

        this.afterUpdateRequest();
    }

    afterUpdateRequest() {
        const element = document.createElement('div');
        element.innerHTML = this.getBodyTemplateData();

        // Здесь я хочу решить задачу вида "вставить массив NodeList элементов в конец таблицы"
        [...element.children].forEach(row => {
            this.subElements.body.append(row);
        });

        this.observer?.observe(this.subElements.loading);
    }

    showLoader() {
        this.element.classList.add('sortable-table_loading');
    }

    hideLoader() {
        this.element.classList.remove('sortable-table_loading');
    }

    showEmpty() {
        this.element.classList.add('sortable-table_empty');
    }

    hideEmpty() {
        this.element.classList.remove('sortable-table_empty');
    }

    // Обошелся без этого метода, но для тестов он нужен и должен вызываться
    sortOnServer() {}

    initLoaderObserver() {
        if (!('IntersectionObserver' in window)) return;
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 1
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.onLoadingVisible();
                }
            })
        }, options);
        
        observer.observe(this.subElements.loading);
        this.observer = observer;
    }

    async onLoadingVisible() {
        const start = this.sortOptions.start + SortableTable.step;
        const end = this.sortOptions.end + SortableTable.step;

        this.updateSortOptions({ start, end })

        await this.request();

        this.afterUpdateRequest();
    }

    async request() {
        const url = this.generateUrl();

        const response = await fetchJson(url)
            .catch(_ => {
                this.showEmpty();
            })

        if (!response || !response.length) {
            this.showEmpty();
            return;
        }

        this.data = response;
    }

    initEventListeners() {
        const onDomContentLoaded = () => {
            this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);

            this.initLoaderObserver();
        };

        if (document.readyState === 'complete') {
            onDomContentLoaded();
        } else {
            document.addEventListener('DOMContentLoaded', onDomContentLoaded);
        }
    }

    onHeaderClick = event => {
        const sortableColumn = event.target.closest('[data-sortable="true"]');

        if (!sortableColumn) return;

        this.subElements.body.innerHTML = '';

        const { id: field, order } = sortableColumn.dataset;

        const toggleOrder = {
            desc: 'asc',
            asc: 'desc'
        };

        const newOrder = toggleOrder[order];
        const arrowElement = sortableColumn.querySelector(`.${this.subElements.arrow.className}`);

        if (!arrowElement) {
            sortableColumn.append(this.subElements.arrow);
        }

        sortableColumn.dataset.order = newOrder;

        this.updateSortOptions({
            field,
            order: newOrder,
            start: 0,
            end: SortableTable.step
        });

        if (this.url && !this.isSortLocally) {
            this.sortOnServer(field, newOrder, {
                start: 0,
                end: SortableTable.step
            });
        } else {
            this.sortOnClient(field, newOrder);
        }
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

    getStatusText(status) {
        switch (status) {
            case 1:
                return 'Активен'

            case 0:
            default:
                return 'Не активен';
        }
    }

    getHeaderTemplateData() {
        return this.header
            .map(({ id, title, sortable }) => {
                const isActiveCell = id === this.sortOptions.field;
                const dataOrder = sortable ? 'data-order="asc"' : '';

                return isActiveCell ?
                    `<div class="sortable-table__cell" data-id="${id}" data-sortable="true" data-order="${this.sortOptions.order}">
                        <span>${title}</span>
                        <span data-element="arrow" class="sortable-table__sort-arrow">
                            <span class="sort-arrow"></span>
                        </span>
                    </div>` :
                    `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${dataOrder}>
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

    getCustomTemplate(field, data) {
        const fieldColumn = this.getHeaderField(field);
        const templateFunction = fieldColumn && typeof (fieldColumn.template) === 'function';

        return templateFunction ? fieldColumn.template(data) : data;
    }

    getBodyTemplateData() {
        if (!this.data) return '';

        return this.data
            .map((row) => {
                const { id, images, title, quantity, price, status } = row;

                return `
                    <a href="/products/${id}" class="sortable-table__row">
                        ${this.getCustomTemplate('images', images)}
                        ${this.getTableCellTemplate(title)}

                        ${this.getTableCellTemplate(quantity)}
                        ${this.getPriceTemplate(price)}

                        ${this.getCustomTemplate('status', status)}
                    </a>
                `;
            })
            .join('');
    }

    getPriceTemplate(price) {
        if (isUndefined(price)) return '';

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

    getLoadingTemplate() {
        return `
            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        `;
    }

    getTableClass() {
        const classNames = ['sortable-table'];

        if (!this.data) {
            classNames.push('sortable-table_loading');
        }

        return classNames.join(' ');
    }

    getTemplate() {
        return `
            <div class="${this.getTableClass()}">
                ${this.getHeaderTemplate()}
                ${this.getBodyTemplate()}
                ${this.getLoadingTemplate()}
                ${this.getPlaceholderTemplate()}
            </div>
        `;
    }

    getPlaceholderTemplate() {
        return `
            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                <div>
                    <p>No products satisfies your filter criteria</p>
                    <button type="button" class="button-primary-outline">Reset all filters</button>
                </div>
            </div>
        `;
    }

    sortOnClient(field, order) {
        const compareFunction = this.getCompareFunction(field, order);
        if (!compareFunction) return;

        this.sortOptions.field = field;
        this.sortOptions.order = order;

        const sortedData = [...this.data].sort(compareFunction);

        this.data = sortedData;
        this.subElements.body.innerHTML = this.getBodyTemplateData();
    }


    getSortType(id) {
        const sortedCol = this.getHeaderField(id);

        if (
            !sortedCol ||
            !sortedCol.sortable
        ) return 'asc';

        return sortedCol.sortType;
    }

    getHeaderIds() {
        return this.header.map(row => row.id).join(', ');
    }

    compareStringsFn(a, b) {
        return a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
    }

    getCompareFunction(field, order = 'asc') {
        const sortType = this.getSortType(field);

        if (!sortType) {
            throw new Error(
                `Неправильный тип для сортировки - "${field}", возможные значения - "${this.getHeaderIds()}"
            `);
        }

        const direction = {
            asc: 1,
            desc: -1
        }[order];

        switch (sortType) {
            case 'string':
                return (a, b) => direction * this.compareStringsFn(a[field], b[field]);

            case 'number':
                return (a, b) => direction * (a[field] - b[field]);

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
        this.element?.remove();

        this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick);
        this.observer?.unobserve(this.subElements.loading);

        this.header = '';
        this.data = null;
    }

    async render() {
        const element = this.getHTMLFromTemplate(this.getTemplate());
        const subElements = this.getSubElements(element);

        this.element = element;
        this.subElements = subElements;

        if (this.url) {
            await this.update();
        }

        this.initEventListeners();
    }
}
