import {
  getFirstDayOfMonth, getLastDayOfMonth,
  getMonthName, getDateName,
} from './utils/datetime.js';

import {
  getHTMLNodeFromTemplate,
  getSubElements,
} from './utils/dom.js';

export default class RangePicker {
  element;
  subElements;

  selectedFrom = null;
  selectedTo = null;

  leftCalendarDate = null;
  rightCalendarDate = null;

  firstOpen = false;

  constructor({ from, to } = {}) {
    this.from = from;
    this.to = to;

    this.selectedFrom = from;
    this.selectedTo = to;

    this.initCalendarDates();

    this.render();
  }

  initCalendarDates() {
    const leftDate = new Date(this.from);
    const leftMonth = leftDate.getMonth();

    this.leftCalendarDate = new Date(leftDate.getFullYear(), leftMonth, 1);

    // Правый календарь идет следующим месяцем после левого
    const rightDate = new Date(leftDate);
    rightDate.setMonth(leftMonth + 1);

    this.rightCalendarDate = new Date(rightDate.getFullYear(), rightDate.getMonth(), 1);
  }

  hideCalendar() {
    this.element.classList.remove('rangepicker_open');
  }

  showCalendar() {
    this.element.classList.add('rangepicker_open');

    if (!this.firstOpen) {
      this.firstOpen = true;

      // Сначала рендерим содержимое селектора
      this.subElements.selector.innerHTML = this.getSelectorTemplate();

      // Потом сохраняем новые subElements
      this.subElements = getSubElements(this.element);

      // Затем навешиваем обработчики событий на новые элементы
      this.addEventListeners();

      // Затем отмечаем выбранный диапазон дат
      this.highlightFromToCells();
    }
  }

  toggleElement() {
    if (this.element.classList.contains('rangepicker_open')) {
      this.hideCalendar();
    } else {
      this.showCalendar();
    }
  }

  clearAllHighlightedCells() {
    const cellsBetween = this.element.querySelectorAll('.rangepicker__selected-between');
    const cellsFrom = this.element.querySelectorAll('.rangepicker__selected-from');
    const cellsTo = this.element.querySelectorAll('.rangepicker__selected-to');

    [...cellsBetween, ...cellsFrom, ...cellsTo].forEach(cell => {
      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-to');
      cell.classList.remove('rangepicker__selected-between');
    })
  }

  highlightFromCell(cell) {
    cell.classList.add('rangepicker__selected-from');
  }

  highlightToCell(cell) {
    cell.classList.add('rangepicker__selected-to');
  }

  highlightBetweenCell(cell) {
    cell.classList.add('rangepicker__selected-between');
  }

  getTimestamp(date) {
    return Number(new Date(date));
  }

  highlightFromToCells() {
    const cells = [...this.element.querySelectorAll('.rangepicker__cell[data-value]')];

    const valueFrom = this.getTimestamp(this.selectedFrom);
    const valueTo = this.getTimestamp(this.selectedTo);

    for (let i = 0, l = cells.length; i < l; i++) {
      const cell = cells[i];
      const value = this.getTimestamp(cell.dataset.value);

      if (value < valueFrom) continue;

      if (value === valueFrom) {
        this.highlightFromCell(cell);
      }

      else if (value > valueFrom && value < valueTo) {
        this.highlightBetweenCell(cell);
      }

      else if (value === valueTo) {
        this.highlightToCell(cell);
      }

      else if (value > valueTo) break;
    }
  }

  setInputRange() {
    this.subElements.from.innerHTML = getDateName(this.selectedFrom);
    this.subElements.to.innerHTML = getDateName(this.selectedTo);
  }

  // Если сначала был клик в позднее число, а потом в раннее - меняем местами from и to
  invertFromToDate() {
    const valueFrom = this.getTimestamp(this.selectedFrom);
    const valueTo = this.getTimestamp(this.selectedTo);

    if (valueFrom > valueTo) {
      const dateTo = this.selectedTo;
      const dateFrom = this.selectedFrom;

      this.selectedFrom = dateTo;
      this.selectedTo = dateFrom;
    }
  }

  cellFromClick(cell) {
    this.selectedFrom = cell.dataset.value;

    this.clearAllHighlightedCells();
    this.highlightFromCell(cell);
  }

  cellToClick(cell) {
    this.selectedTo = cell.dataset.value;

    // Если сначала был клик в позднее число, а потом в раннее - меняем местами from и to
    this.invertFromToDate();

    this.highlightFromToCells();

    this.hideCalendar();
    this.setInputRange();

    this.triggerRangeEvent();
  }

  triggerRangeEvent() {
    const event = new CustomEvent('date-select', {
      bubbles: true,
      detail: {
        from: this.selectedFrom,
        to: this.selectedTo
      }
    });

    this.element.dispatchEvent(event);
  }

  monthNameChange(direction) {
    const toggleStep = {
      'left': -1,
      'right': 1
    };

    const step = toggleStep[direction];

    this.leftCalendarDate.setMonth(this.leftCalendarDate.getMonth() + step);
    this.rightCalendarDate.setMonth(this.rightCalendarDate.getMonth() + step);

    const changeDateField = (element, date) => {
      element.innerHTML = date;
      element.setAttribute('datetime', date);
    }

    changeDateField(this.subElements.datetimeLeft, getMonthName(this.leftCalendarDate));
    changeDateField(this.subElements.datetimeRight, getMonthName(this.rightCalendarDate));

    this.subElements.gridLeft.innerHTML = this.getGridTemplate(this.leftCalendarDate);
    this.subElements.gridRight.innerHTML = this.getGridTemplate(this.rightCalendarDate);

    this.highlightFromToCells();
  }

  getGridTemplate(date) {
    const startFrom = getFirstDayOfMonth(date);
    const lastDay = getLastDayOfMonth(date);

    return new Array(lastDay)
      .fill('')
      .map((_, day) => this.getCellTemplate({
        day,
        startFrom,
        defaultDate: date,
      }))
      .join('');
  }

  getCellTemplate({ day, startFrom, defaultDate }) {
    const classes = ['rangepicker__cell'];
    const startFromStyle = day === 0 ? `style="--start-from: ${startFrom}"` : '';

    const newDate = new Date(defaultDate);
    newDate.setDate(day + 1);

    return `
      <button
        type="button"
        class="${classes.join(' ')}"
        data-value="${newDate.toLocaleString('en-US')}"
        ${startFromStyle}
      >${day + 1}</button>
    `;
  }

  onDocumentClick = event => {
    const insideCalendar = event.target.closest('[data-element="selector"]');
    const insideInput = event.target.closest('[data-element="input"]');

    // Если клик был внутри календаря или в input - ничего не делаем
    if (insideCalendar || insideInput) return;

    // В остальных случаях скрываем календарь
    this.hideCalendar();
  }

  getInputTemplate() {
    return `
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${getDateName(this.from)}</span> -
        <span data-element="to">${getDateName(this.to)}</span>
      </div>
    `;
  }

  getDayOfWeekStaticTemplate() {
    return `
      <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
      </div>
    `;
  }

  getCalendarTemplate({
    date,
    position,
  }) {
    const month = getMonthName(date);
    const days = this.getGridTemplate(date);

    let datetimeName = '';
    let gridName = '';

    switch (position) {
      case 'LEFT':
        datetimeName = 'datetimeLeft';
        gridName = 'gridLeft';
        break;

      case 'RIGHT':
        datetimeName = 'datetimeRight';
        gridName = 'gridRight';
        break;
    }

    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
            <time data-element="${datetimeName}" datetime="${month}">${month}</time>
        </div>
        ${this.getDayOfWeekStaticTemplate()}
        <div data-element="${gridName}" class="rangepicker__date-grid">
            ${days}
        </div>
      </div>
    `;
  }

  getTemplate() {
    return `
      <div class="rangepicker">
        ${this.getInputTemplate()}  
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
      `;
  }

  getSelectorTemplate() {
    const leftCalendar = this.getCalendarTemplate({
      date: this.leftCalendarDate,
      position: 'LEFT',
    });

    const rightCalendar = this.getCalendarTemplate({
      date: this.rightCalendarDate,
      position: 'RIGHT'
    });

    return `
      <div class="rangepicker__selector-arrow"></div>
      <div data-element="selectorControlLeft" data-direction="left" class="rangepicker__selector-control-left"></div>
      <div data-element="selectorControlRight" data-direction="right" class="rangepicker__selector-control-right"></div>
      ${leftCalendar}
      ${rightCalendar}
    `;
  }

  addEventListeners() {
    this.element.addEventListener('click', this.onElementClick);

    this.subElements.input.addEventListener('click', this.onInputClick);

    this.subElements.selectorControlLeft?.addEventListener('click', this.onSelectorControlClick);
    this.subElements.selectorControlRight?.addEventListener('click', this.onSelectorControlClick);

    document.addEventListener('click', this.onDocumentClick);
  }

  removeEventListeners() {
    this.element.removeEventListener('click', this.onElementClick);

    this.subElements.input.removeEventListener('click', this.onInputClick);

    this.subElements.selectorControlLeft?.removeEventListener('click', this.onSelectorControlClick);
    this.subElements.selectorControlRight?.removeEventListener('click', this.onSelectorControlClick);

    document.removeEventListener('pointerdown', this.onDocumentClick);
  }

  onElementClick = event => {
    const insideInput = event.target.closest('[data-element="input"]');
    const insideMonthChange = event.target.closest('[data-direction]');

    if (insideInput || insideMonthChange) return;

    const insideCell = event.target.closest('[data-value]');

    if (insideCell) {
      // Если пошел выбор повторного интервала - сбрасываем прежние значения
      if (this.selectedTo) {
        this.selectedFrom = null;
        this.selectedTo = null;
      }

      if (!this.selectedFrom) {
        this.cellFromClick(insideCell);
      }

      else if (!this.selectedTo) {
        this.cellToClick(insideCell);
      }
    }
  }

  onSelectorControlClick = event => {
    const direction = event.currentTarget.dataset.direction;

    direction && this.monthNameChange(direction);
  }

  onInputClick = event => {
    this.toggleElement();

    // Не нужно выделять текст в input'е
    event.preventDefault();

    return;
  }

  destroy() {
    this.removeEventListeners();

    this.remove();
    this.element = '';

  }

  remove() {
    this.element?.remove();
  }

  render() {
    const element = getHTMLNodeFromTemplate(this.getTemplate());
    const subElements = getSubElements(element);

    this.element = element;
    this.subElements = subElements;

    this.addEventListeners();
  }
}
