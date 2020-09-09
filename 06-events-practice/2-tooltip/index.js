class Tooltip {
    element;

    TOOLTIP_OFFSET = 10; // отступы в пикселях от курсора мыши до тултипа

    constructor() {
        this.onPointerOver = this.onPointerOver.bind(this);
        this.onPointerOut = this.onPointerOut.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
    }

    initEventListeners() {
        document.addEventListener('pointerover', this.onPointerOver);
        document.addEventListener('pointermove', this.onPointerMove);
        document.addEventListener('pointerout', this.onPointerOut);
    }

    onPointerOver(event) {
        const tooltipElement = event.target.closest('[data-tooltip]');

        if (!tooltipElement) return;

        const options = this.getTooltipCoords(event.clientX, event.clientY);

        this.render(tooltipElement.dataset.tooltip, options);
    }

    onPointerOut() {
        this.remove();
    }

    getTooltipCoords(clientX, clientY) {
        return {
            left: clientX + this.TOOLTIP_OFFSET + 'px',
            top: clientY + this.TOOLTIP_OFFSET + 'px'
        };
    }

    onPointerMove(event) {
        if (!this.element) return;

        const { left, top } = this.getTooltipCoords(event.clientX, event.clientY);

        this.setTooltipCoords(left, top);
    }

    setTooltipCoords(left, top) {
        this.element.style.left = left;
        this.element.style.top = top;
    }

    removeEventListener() {
        document.removeEventListener('pointerover', this.onPointerOver);
        document.removeEventListener('pointermove', this.onPointerMove);
        document.removeEventListener('pointerout', this.onPointerOut);
    }

    destroy() {
        this.remove();

        this.removeEventListener();
    }

    remove() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }

    getHTMLFromTemplate(template) {
        const parentNode = document.createElement('div');

        parentNode.innerHTML = template;

        return parentNode.firstElementChild;
    }

    getTooltipStyle({ left, top } = {}) {
        if (!left && !top) return '';

        return `style="left: ${left}; top: ${top};"`;
    }

    getTooltipTemplate(content = '', options) {
        const style = this.getTooltipStyle(options);

        return `<div class="tooltip" ${style}>${content}</div>`;
    }

    initialize() {
        this.initEventListeners();
    }

    hideTooltip() {
        this.element.innerHTML = '';
    }

    render(content, options) {
        if (this.element) return;

        this.element = this.getHTMLFromTemplate(this.getTooltipTemplate(content, options));

        document.body.append(this.element);
    }
}

const tooltip = new Tooltip();

export default tooltip;
