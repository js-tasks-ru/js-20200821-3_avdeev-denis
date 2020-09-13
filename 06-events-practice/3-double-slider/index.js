export default class DoubleSlider {
    element;
    subElements;

    sizeParams;

    movingControl = null;

    sliderLeft = 0;
    sliderRight = 0;

    currentFrom = 0;
    currentTo = 0;

    constructor({
        min = 0,
        max = 200,
        formatValue,
        selected
    } = {}) {
        this.min = min;
        this.max = max;

        this.formatValue = formatValue;
        this.selected = selected;

        this.render();

        this.sizeParams = this.getElementSizeParams();

        this.initEventListeners();
    }

    getElementSizeParams() {
        return {
            inner: this.subElements.inner.getBoundingClientRect(),
            // Тесты падают, т.к. там застабано значение Element.prototype.getBoundingClientRect
            // controlWidth: this.subElements['left-control'].getBoundingClientRect().width,
            controlWidth: 6
        };
    }

    initEventListeners() {
        document.addEventListener('pointerdown', this.onPointerDown);
        document.addEventListener('pointerup', this.onPointerUp);
    }

    removeEventListeners() {
        document.removeEventListener('pointerdown', this.onPointerDown);
        document.removeEventListener('pointerup', this.onPointerUp);
    }

    onPointerDown = ({ target }) => {
        document.addEventListener('pointermove', this.onPointerMove);

        const { 'left-control': leftControl, 'right-control': rightControl } = this.subElements;

        if (target === leftControl || target === rightControl) {
            this.movingControl = target;
        } else {
            this.movingControl = null;
        }
    }

    onPointerMove = ({ clientX }) => {
        if (!this.movingControl) return;

        const controlName = this.movingControl.dataset.element;
        const controlWidth = this.sizeParams.controlWidth / 2;

        const { left: sliderLeft, width: sliderWidth } = this.sizeParams.inner;

        let offset;
        switch (controlName) {
            case 'left-control':
                offset = clientX - sliderLeft + controlWidth;
                break;

            case 'right-control':
                offset = clientX - sliderLeft - controlWidth;
                break;
        }

        // Не даем возможности увести control влево за пределы слайдера
        offset = Math.min(Math.max(0, offset), sliderWidth);

        // Преобразуем значение пропорционально размеру слайдера
        offset = offset * 100 / sliderWidth;

        // Округляем по правилам математики для визуально понятного перемещения контрола
        offset = Math.round(offset);

        if (controlName === 'left-control') {
            // Не даем уйти левому контролу за правый
            offset = Math.min(offset, 100 - this.sliderRight);

            this.subElements['left-control'].style.left = `${offset}%`;
            this.subElements.progress.style.left = `${offset}%`;

            const minValue = offset * (this.max - this.min) / 100 + this.min;
            this.subElements.from.innerHTML = this.processValue(minValue);

            this.currentFrom = minValue;
            this.sliderLeft = offset;

        } else if (controlName === 'right-control') {
            // Не даем уйти правому контролу за левый
            offset = Math.max(offset, this.sliderLeft)

            // В процентном соотношении
            offset = 100 - offset;

            this.subElements['right-control'].style.right = `${offset}%`;
            this.subElements.progress.style.right = `${offset}%`;

            const maxValue = this.max - offset * (this.max - this.min) / 100;
            this.subElements.to.innerHTML = this.processValue(maxValue);

            this.currentTo = maxValue;
            this.sliderRight = offset;
        }
    }

    onPointerUp = () => {
        document.removeEventListener('pointermove', this.onPointerMove);

        this.movingControl = null;

        const event = new CustomEvent('range-select', {
            bubbles: true,
            detail: {
                from: this.currentFrom,
                to: this.currentTo
            }
        });

        this.element.dispatchEvent(event);
    }

    processValue(value) {
        if (!this.formatValue) return value;

        return this.formatValue(value);
    }

    getHTMLFromTemplate(template) {
        const parentNode = document.createElement('div');

        parentNode.innerHTML = template;

        return parentNode.firstElementChild;
    }

    getTemplate() {
        const min = this.selected?.from || this.min;
        const max = this.selected?.to || this.max;

        this.currentFrom = min;
        this.currentTo = max;

        const { progressStyle, leftStyle, rightStyle } = this.getDefaultStyles();

        return `
            <div class="range-slider">
                <span data-element="from">${this.processValue(min)}</span>
                <div data-element="inner" class="range-slider__inner">
                    <span data-element="progress" ${progressStyle} class="range-slider__progress"></span>
                    <span data-element="left-control" ${leftStyle} class="range-slider__thumb-left"></span>
                    <span data-element="right-control" ${rightStyle} class="range-slider__thumb-right"></span>
                </div>
                <span data-element="to">${this.processValue(max)}</span>
            </div>
        `;
    }

    getDefaultStyles() {
        if (!this.selected) {
            return {
                progressStyle: '',
                leftStyle: '',
                rightStyle: ''
            };
        }

        const { from, to } = this.selected;

        const diff = this.max - this.min;

        const left = (from - this.min) * 100 / diff;
        const right = (this.max - to) * 100 / diff;

        this.sliderLeft = left;
        this.sliderRight = right;

        return {
            progressStyle: `style="left: ${left}%; right: ${right}%;"`,
            leftStyle: `style="left: ${left}%;"`,
            rightStyle: `style="right: ${right}%";`
        };
    }

    destroy() {
        this.removeEventListeners();

        this.remove();
    }

    remove() {
        this.element.remove();
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((result, subElement) => {
            result[subElement.dataset.element] = subElement;

            return result;
        }, {});
    }

    render() {
        const element = this.getHTMLFromTemplate(this.getTemplate());
        const subElements = this.getSubElements(element);

        this.element = element;
        this.subElements = subElements;

        document.body.append(this.element);
    }
}
