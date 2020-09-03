export default class ColumnChart {
    element; // HTMLElement;

    STATIC_LABEL_PREFIX = 'Total '; // префикс, который идет перед лейблом

    chartHeight; // максимальная высота одной полоски из css-property
    DEFAULT_MAX_HEIGHT = 50; // максимальная высота одной полоски на графике по-умолчанию

    CHARTS_SELECTOR = '.dashboard__charts';
    CHART_HEIGHT_CSS_PROPERTY = '--chart-height';

    constructor(props) {
        this.init(props);

        this.render();
    }

    init(props = {}) {
        const { data, label, value, link } = props;

        this.setMaxHeight();

        this.data = this.prepareData(data);
        this.label = this.prepareLabel(label);
        this.link = this.prepareLink(link);
        this.value = this.prepareValue(value);
    }

    setMaxHeight() {
        if (this.chartHeight) {
            return this.chartHeight;
        }

        const chartsNode = document.querySelector(this.CHARTS_SELECTOR);
        const chartHeight = chartsNode && window.getComputedStyle(chartsNode)
            .getPropertyValue(this.CHART_HEIGHT_CSS_PROPERTY);

        if (!chartHeight) {
            this.setDefaultMaxHeight();
            return;
        }

        this.chartHeight = parseInt(chartHeight, 10);
    }

    setDefaultMaxHeight() {
        this.chartHeight = this.DEFAULT_MAX_HEIGHT;
    }
    
    prepareData(data) {
        if (!data || !data.length) return null;

        const maxValue = data.reduce((max, current) => current > max ? current : max, 0);
        const scale = this.chartHeight / maxValue;

        return data.map(value => this.prepareDataValue(value, scale, maxValue));
    }

    prepareDataValue(value, scale, maxValue) {
        const percentValue = (value / maxValue * 100).toFixed(0);
        const processedValue = String(Math.floor(value * scale));

        return {
            percent: percentValue + '%',
            value: processedValue
        };
    }
    
    prepareLabel(label) {
        if (!label) return '';

        return this.STATIC_LABEL_PREFIX + label;
    }

    prepareLink(link) {
        if (!link) return null;

        return link;
    }

    prepareValue(value) {
        if (!value) return null;

        return value.toString();
    }

    getChartLinkText() {
        if (!this.link) return '';

        return `
            <a class="column-chart__link" href="${this.link}">View all</a>
        `;
    }
    
    getChartText() {
        return `
            <div class="column-chart">
                <div class="column-chart__title">
                    ${this.label}
                    ${this.getChartLinkText()}
                </div>
                <div class="column-chart__container">
                    <div class="column-chart__header">${this.value}</div>
                    <div class="column-chart__chart">
                        ${this.drawChartColumns()}
                    </div>
                </div>
            </div>
        `;
    }

    drawChartColumns() {
        return this.data.reduce((acc, { value, percent }) => {
            return acc + `<div style="--value:${value}" data-tooltip=${percent}></div>`
        }, '');
    }

    getPlaceholderText() {
        return `
            <div class="column-chart column-chart_loading">
                <div class="column-chart__title">
                    ${this.label}
                    ${this.getChartLinkText()}
                </div>
                <div class="column-chart__container">
                    <div class="column-chart__header">${this.value}</div>
                </div>
            </div>
        `;
    }

    getHTMLNodeFromText(elementText) {
        const parentNode = document.createElement('div');

        parentNode.innerHTML = elementText;

        return parentNode.firstElementChild;
    }

    destroy() {
        //
    }

    remove() {
        this.clear();
    }

    clear() {
        this.data = null;
        this.element = null;
    }

    update(newData) {
        this.data = this.prepareData(newData);

        this.render();
    }

    render() {
        const elementText = this.data ?
            this.getChartText() :
            this.getPlaceholderText();

        const elementHtml = this.getHTMLNodeFromText(elementText);
        this.element = elementHtml;
    }
}
