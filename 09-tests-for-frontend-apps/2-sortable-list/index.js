export default class SortableList {
    element;

    movingElement = null;
    placeholder = null;

    itemHeight = 0;

    topCoords = [];

    constructor({ items } = {}) {
        this.items = items;

        this.render();

        document.addEventListener('pointerdown', this.onPointerDown);
    }

    static appendBefore(element, newElement) {
        element.parentNode.insertBefore(newElement, element);
    }

    static appendAfter(element, newElement) {
        element.parentNode.insertBefore(newElement, element.nextSibling);
    }

    getList() {
        const list = document.createElement('ul');
        list.classList.add('sortable-list');

        this.items.forEach((item, index) => {
            item.classList.add('sortable-list__item');
            item.setAttribute('data-index', index);
            list.append(item);
        });

        return list;
    }

    /**
     * Сохраняем top-координаты всех элементов списка для того, чтобы определить к какому элементу ближе мы двигаем элемент
     */
    setTopCoordItems() {
        this.topCoords = [...this.element.querySelectorAll('.sortable-list__item')].map(item => ({
            element: item,
            top: item.getBoundingClientRect().top
        }));
    }

    onDeleteElementClick = event => {
        event.target.closest('li').remove();

        this.recallItemIndexes();
    }

    onGrabElementClick = event => {
        this.setTopCoordItems();

        this.movingElement = event.target.closest('li');

        this.itemHeight = this.movingElement.offsetHeight;

        this.movingElement.style.width = `${this.movingElement.offsetWidth}px`;
        this.movingElement.style.height = `${this.movingElement.offsetHeight}px`;

        this.movingElement.classList.add('sortable-list__item_dragging');

        let shiftX = event.clientX - this.movingElement.getBoundingClientRect().left;
        let shiftY = event.clientY - this.movingElement.getBoundingClientRect().top;

        this.createPlaceholder();

        SortableList.appendAfter(this.movingElement, this.placeholder);

        const moveAt = (pageX, pageY) => {
            const closestElement = this.getClosestElement(pageY);

            if (!this.closestElement) {
                this.closestElement = closestElement;
                return;
            }

            /**
             * Вставляем placeholder в новое место только в случае если оно изменилось
             */
            if (closestElement !== this.closestElement) {
                if (closestElement.dataset.index < this.movingElement.dataset.index) {
                    SortableList.appendBefore(closestElement, this.placeholder);
                } else {
                    SortableList.appendAfter(closestElement, this.placeholder);
                }

                this.closestElement = closestElement;
            }

            this.movingElement.style.left = pageX - shiftX + 'px';
            this.movingElement.style.top = pageY - shiftY + 'px';
        }

        const onPointerMove = event => {
            moveAt(event.pageX, event.pageY);
        };

        const onPointerUp = () => {
            SortableList.appendAfter(this.placeholder, this.movingElement);

            this.movingElement.classList.remove('sortable-list__item_dragging');
            this.movingElement.removeAttribute('style');

            this.recallItemIndexes();

            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);

            this.placeholder.remove();
        };

        moveAt(event.pageX, event.pageY);

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }

    onPointerDown = event => {
        const dataset = event.target.dataset;

        event.preventDefault();

        if ('deleteHandle' in dataset) {
            this.onDeleteElementClick(event);
        }

        if ('grabHandle' in dataset) {
            this.onGrabElementClick(event);
        }
    }

    recallItemIndexes() {
        [...this.element.querySelectorAll('.sortable-list__item')].forEach((item, index) => {
            item.setAttribute('data-index', index);
        });
    }

    getClosestElement(pageY) {
        const closestElementItem = this.topCoords.reduce((result, current) => {
            /**
             * Определяем к какому элементу ближе всего мы находимся
             * (чтобы учесть приближение на более чем половину высоты элемента - добавляем к кординатам половину высоты элемента списка)
             */
            const offset = Math.abs(current.top - pageY + this.itemHeight / 2);

            if (offset < result.top) {
                result = {
                    top: offset,
                    element: current.element
                };
            }

            return result;
        }, { top: Infinity });

        return closestElementItem.element;
    }

    createPlaceholder() {
        const placeholder = document.createElement('div');

        placeholder.classList.add('sortable-list__placeholder');

        placeholder.style.width = `${this.movingElement.offsetWidth}px`;
        placeholder.style.height = `${this.movingElement.offsetHeight}px`;

        this.placeholder = placeholder;
    }

    remove() {
        this.element?.remove();
    }

    destroy() {
        this.remove();

        document.removeEventListener('pointerdown', this.onPointerDown);
    }

    render() {
        const element = this.getList();

        this.element = element;
    }
}
