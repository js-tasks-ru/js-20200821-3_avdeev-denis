import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

export default class Page {
    element;
    subElements = {};
    components = {};

    initialize() {
        // example date
        this.dateFrom = new Date('2020-08-24T21:27:21.688Z');
        this.dateTo = new Date('2020-09-23T21:27:21.688Z');

        const rangePicker = new RangePicker({
            from: this.dateFrom,
            to: this.dateTo
        });

        this.components.rangePicker = rangePicker;
        this.subElements.rangePicker = rangePicker.element;

        const ordersChart = new ColumnChart({
            url: 'api/dashboard/orders',
            range: {
                from: this.dateFrom,
                to: this.dateTo
            },
            label: 'orders'
        });

        this.components.ordersChart = ordersChart;
        this.subElements.ordersChart = ordersChart.element;

        const salesChart = new ColumnChart({
            url: 'api/dashboard/sales',
            range: {
                from: this.dateFrom,
                to: this.dateTo
            },
            formatHeading: heading => '$' + heading,
            label: 'sales'
        });

        this.components.salesChart = salesChart;
        this.subElements.salesChart = salesChart.element;

        const customersChart = new ColumnChart({
            url: 'api/dashboard/customers',
            range: {
                from: this.dateFrom,
                to: this.dateTo
            },
            label: 'customers'
        });

        this.components.customersChart = customersChart;
        this.subElements.customersChart = customersChart.element;

        const sortableTable = new SortableTable(header, {
            url: 'api/dashboard/bestsellers',
            isSortLocally: true
        });

        this.components.sortableTable = sortableTable;
        this.subElements.sortableTable = sortableTable.element;
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((result, subElement) => {
            result[subElement.dataset.element] = subElement;

            return result;
        }, this.subElements);
    }

    getPageTemplate() {
        return `
            <div class="dashboard full-height flex-column">
                <div class="content__top-panel">
                    <h2 class="page-title">Панель управления</h2>
                    <div data-element="rangePicker" class="rangepicker"></div>
                </div>
                <div data-element="dashboardCharts" class="dashboard__charts"></div>
                <h3 class="block-title">Лидеры продаж</h3>
            </div>
        `;
    }

    getHTMLNodeFromText(elementText) {
        const parentNode = document.createElement('div');

        parentNode.innerHTML = elementText;

        return parentNode.firstElementChild;
    }

    appendComponents() {
        this.subElements.rangePicker.append(this.components.rangePicker.element);

        this.components.ordersChart.element.classList.add('dashboard__chart_orders');
        this.subElements.dashboardCharts.append(this.components.ordersChart.element);

        this.components.salesChart.element.classList.add('dashboard__chart_sales');
        this.subElements.dashboardCharts.append(this.components.salesChart.element);

        this.components.customersChart.element.classList.add('dashboard__chart_customers');
        this.subElements.dashboardCharts.append(this.components.customersChart.element);

        this.element.append(this.subElements.sortableTable);
    }

    onSelectDate = ({ detail }) => this.updateComponents(detail.from, detail.to);

    updateComponents(from, to) {
        this.components.ordersChart.update(from, to);
        this.components.salesChart.update(from, to);
        this.components.customersChart.update(from, to);
        this.components.sortableTable.update({ from, to });
    }

    addEventListeners() {
        this.subElements.rangePicker.addEventListener('date-select', this.onSelectDate);
    }

    removeEventListeners() {
        this.subElements.rangePicker.removeEventListener('date-select', this.onSelectDate);
    }

    destroy() {
        this.removeEventListeners();

        this.remove();
    }

    remove() {
        this.element.remove();
    }

    render() {
        this.initialize();

        const element = this.getHTMLNodeFromText(this.getPageTemplate());
        const subElements = this.getSubElements(element);

        this.element = element;
        this.subElements = subElements;

        this.appendComponents();
        this.addEventListeners();

        return element;
    }
}
