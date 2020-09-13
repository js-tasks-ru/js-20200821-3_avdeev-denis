import fetch from './utils/fetch-json.js';

import { BACKEND_URL } from '../utils.js';

export default class ColumnChart {
    element;
    subElements;

    chartHeight; // максимальная высота одной полоски из css-property
    DEFAULT_MAX_HEIGHT = 50; // максимальная высота одной полоски на графике по-умолчанию

    totalHeading = 0;

    constructor(props) {
        this.init(props);

        this.render();

        if (this.range) {
            this.update(this.range.from, this.range.to);
        }
    }

    init({ url, range = {}, label, link, formatHeading } = {}) {
        this.setMaxHeight();

        this.url = url;
        this.range = range;

        this.label = this.prepareLabel(label);
        this.link = this.prepareLink(link);

        this.formatHeading = formatHeading;
    }

    setMaxHeight() {
        if (this.chartHeight) {
            return this.chartHeight;
        }

        const chartsNode = document.querySelector('.dashboard__charts');
        const chartHeight = chartsNode && window.getComputedStyle(chartsNode)
            .getPropertyValue('--chart-height');

        this.chartHeight = chartHeight ?
            parseInt(chartHeight, 10) : this.DEFAULT_MAX_HEIGHT;
    }

    prepareData(data) {
        if (!data || !data.length) return null;

        const maxValue = Math.max(...data);
        const scale = this.chartHeight / maxValue;

        return data.map(value => this.prepareDataValue(value, scale, maxValue));
    }

    prepareDataValue(value, scale, maxValue) {
        const percentValue = (value / maxValue * 100).toFixed(0);
        const processedValue = Math.floor(value * scale);

        return {
            percent: percentValue + '%',
            value: processedValue
        };
    }

    prepareLabel(label) {
        if (!label) return '';

        return 'Total ' + label;
    }

    prepareLink(link) {
        if (!link) return null;

        return link;
    }

    getLink() {
        if (!this.link) return '';

        return `
            <a class="column-chart__link" href="${this.link}">View all</a>
        `;
    }

    getChartTemplate() {
        return `
            <div data-element="chart" class="${this.getChartClass()}">
                <div class="column-chart__title">
                    ${this.label}
                    ${this.getLink()}
                </div>
                <div data-element="container" class="column-chart__container">
                    ${this.getContainerContent()}
                </div>
            </div>
        `;
    }

    getContainerContent() {
        const columns = this.getColumns();

        return `
            <div data-element="header" class="column-chart__header">${this.getHeader()}</div>
            <div data-element="body" class="column-chart__chart">
                ${columns}
            </div>
        `;
    }

    getChartClass() {
        const classNames = ['column-chart'];

        if (!this.data) {
            classNames.push('column-chart_loading');
        }

        return classNames.join(' ');
    }

    getColumns() {
        if (!this.data) return;

        this.totalHeading = 0;

        return this.data
            .map(({ value, percent }) => {
                this.totalHeading += value;

                return `<div style="--value:${value}" data-tooltip=${percent}></div>`;
            })
            .join('');
    }

    getHeader() {
        if (!this.formatHeading) return this.totalHeading;

        return this.formatHeading(this.totalHeading);
    }

    getHTMLNodeFromTemplate(template) {
        const parentNode = document.createElement('div');

        parentNode.innerHTML = template;

        return parentNode.firstElementChild;
    }

    destroy() {
        this.remove();
    }

    remove() {
        this.element?.remove();

        this.data = null;
    }

    placeholderHide = () => {
        this.element.classList.remove('column-chart_loading');
    }

    placeholderShow = () => {
        this.element.classList.add('column-chart_loading');
    }

    createUrl(from, to) {
        const url = new URL(BACKEND_URL + this.url);

        url.searchParams.append('from', from);
        url.searchParams.append('to', to);

        return url;
    }

    update(from, to) {
        this.placeholderShow();

        this.range.from = from;
        this.range.to = to;

        const url = this.createUrl(from, to);

        return fetch(url)
            .then(this.onFetchSuccess)
            .catch(this.placeholderHide);
    }

    onFetchSuccess = response => {
        if (!response) return;

        this.placeholderHide();

        const values = Object.values(response);
        this.data = this.prepareData(values);

        this.subElements.body.innerHTML = this.getColumns();
        this.subElements.header.innerHTML = this.getHeader();
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((result, subElement) => {
            result[subElement.dataset.element] = subElement;

            return result;
        }, {});
    }

    render() {
        const element = this.getHTMLNodeFromTemplate(this.getChartTemplate());
        const subElements = this.getSubElements(element);

        this.element = element;
        this.subElements = subElements;
    }
}
