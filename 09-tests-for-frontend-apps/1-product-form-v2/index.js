import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import ImageUploader from '../../08-forms-fetch-api-part-2/1-product-form-v1/utils/image-uploader.js';
import SortableList from '../2-sortable-list/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

const PRODUCTS_URL = BACKEND_URL + '/api/rest/products';
const CATEGORIES_URL = BACKEND_URL + '/api/rest/categories';

export default class ProductForm {
  element;
  subElements;

  product = {
    description: '',
    discount: 0,
    images: [],
    price: 100,
    quantity: 1,
    status: 1,
    subcategory: '',
    title: '',
  };

  constructor(productId) {
    this.productId = productId;

    this.onFileInputChange = this.onFileInputChange.bind(this);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;

      return result;
    }, {});
  }

  getHTMLNodeFromTemplate(template) {
    const parentNode = document.createElement('div');

    parentNode.innerHTML = template;

    return parentNode.firstElementChild;
  }

  getProductUrl(productId) {
    const url = new URL(PRODUCTS_URL);

    if (productId) {
      url.searchParams.set('id', productId);
    }

    return url;
  }

  getCategoriesUrl() {
    const url = new URL(CATEGORIES_URL);

    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return url;
  }

  async getProductData() {
    if (!this.productId) {
      return Promise.resolve(null);
    }

    const response = await fetchJson(this.getProductUrl(this.productId));

    return response && response[0];
  }

  async getCategoriesData() {
    const response = await fetchJson(this.getCategoriesUrl());

    return response;
  }

  getTitleTemplate() {
    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input
            id="title"
            data-element="titleInput"
            required=""
            type="text"
            name="title"
            class="form-control"
            placeholder="Название товара"
            value="${escapeHtml(this.product.title)}"
          >
        </fieldset>
      </div>
    `;
  }

  getDescriptionTemplate() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea
          id="description"
          data-element="descriptionTextarea"
          required=""
          class="form-control"
          name="description"
          data-element="productDescription"
          placeholder="Описание товара"
        >${escapeHtml(this.product.description)}</textarea>
      </div>
    `;
  }

  getImagesTemplate() {
    return `
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul data-element="imageList" class="sortable-list"></ul>
        </div>
        <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>
    `;
  }

  getImageItemsTemplate() {
    return this.product.images
      .map(({ url, source }) =>
        this.getHTMLNodeFromTemplate(
          this.getImageItemTemplate({ url, source })
        )
      );
  }

  getImageItemTemplate({ url, source }) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name=" source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  getCategoriesTemplate() {
    const categories = this.getCategoryItemsTemplate();

    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select id="subcategory" class="form-control" data-element="subcategorySelect" name="subcategory">
          ${categories}
        </select>
      </div>
    `;
  }

  getCategoryItemsTemplate() {
    const DELIMITER = ' &gt; ';

    return this.categories.map(({ title: categoryTitle, subcategories }) => {
      return subcategories.map(({ id, title: subcategoryTitle }) => {
        const title = categoryTitle + DELIMITER + subcategoryTitle;
        const selected = id === this.product.subcategory ? 'selected' : '';

        return `
          <option value="${id}" ${selected}>${title}</option>
        `;
      }).join('');
    }).join('');
  }

  getPriceTemplate() {
    return `
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input
            id="price"
            required=""
            data-element="priceInput"
            type="number"
            name="price"
            class="form-control"
            placeholder="100"
            value=${this.product.price}
          />
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input
            id="discount"
            required=""
            data-element="discountInput"
            type="number"
            name="discount"
            class="form-control"
            placeholder="0"
            value="${this.product.discount}"
          />
        </fieldset>
      </div>
    `;
  }

  getQuantityTemplate() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input
          id="quantity"
          required=""
          data-element="quantityInput"
          type="number"
          class="form-control"
          name="quantity"
          placeholder="1"
          value="${this.product.quantity}"
        />
      </div>
    `;
  }

  getStatusTemplate() {
    const avaliableStatuses = {
      0: 'Не активен',
      1: 'Активен'
    };

    const statuses = Object.keys(avaliableStatuses).map(value => {
      const statusText = avaliableStatuses[value];
      const selected = this.product.status === Number(value) ? 'selected' : '';

      return `
        <option ${selected} value="${value}">${statusText}</option>
      `;
    }).join('');

    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select id="status" class="form-control" data-element="statusSelect" name="status">
          ${statuses}
        </select>
      </div>
    `;
  }

  getSaveButtonTemplate() {
    return `
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    `;
  }

  async getTemplate() {
    const [categoriesData, productData] = await Promise.all([
      this.getCategoriesData(),
      this.getProductData()
    ]);

    if (productData) {
      this.product = productData;
    }

    this.categories = categoriesData;

    const [
      title, description, images,
      categories, price, quantity,
      status, saveButton
    ] = [
        this.getTitleTemplate(),
        this.getDescriptionTemplate(),
        this.getImagesTemplate(),

        this.getCategoriesTemplate(),
        this.getPriceTemplate(),
        this.getQuantityTemplate(),

        this.getStatusTemplate(),
        this.getSaveButtonTemplate()
      ];

    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          ${title}
          ${description}
          ${images}

          ${categories}
          ${price}
          ${quantity}

          ${status}
          ${saveButton}
        </form>
      </div>
    `;
  }

  getFileInput() {
    if (this.subElements.fileInput) {
      return this.subElements.fileInput;
    }

    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.dataset.element = 'fileInput';
    fileInput.hidden = true;

    this.subElements.fileInput = fileInput;
    document.body.appendChild(this.subElements.fileInput);

    this.subElements.fileInput.addEventListener('change', this.onFileInputChange);

    return this.subElements.fileInput;
  }

  onUploadImage = () => {
    const fileInput = this.getFileInput();

    const event = new MouseEvent('click', {
      bubbles: true,
    });

    fileInput.dispatchEvent(event);
  };

  async onFileInputChange(event) {
    const [image] = event.target.files;

    if (!image) return;

    const uploader = new ImageUploader();
    const response = await uploader.upload(image);
    
    if (!response || !response.success) return;
    
    this.addImageItemField({
      url: response.data.link,
      source: response.data.id
    });
  };

  addImageItemField(options) {
    const imageElement = this.getHTMLNodeFromTemplate(
      this.getImageItemTemplate(options)
    );

    this.subElements.imageList.append(imageElement);
  }

  addEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.onFormSubmit);

    this.subElements.uploadImage.addEventListener('pointerdown', this.onUploadImage);
  }

  removeEventListeners() {
    this.subElements.productForm.removeEventListener('submit', this.onFormSubmit);

    this.subElements.uploadImage.removeEventListener('pointerdown', this.onUploadImage);

    this.subElements.fileInput?.removeEventListener('change', this.onFileInputChange);
  }

  getImagesFromFormFields() {
    const listItems = this.subElements.imageListContainer.querySelectorAll('li');

    return [...listItems].map(item => {
      const [urlInput, sourceInput] = item.children;

      return {
        url: urlInput.value,
        source: sourceInput.value
      };
    });
  }

  getProductDataFromElements() {
    const productData = {
      title: escapeHtml(this.subElements.titleInput.value),
      description: escapeHtml(this.subElements.descriptionTextarea.value),
      discount: Number(this.subElements.discountInput.value),
      id: this.productId,
      images: this.getImagesFromFormFields(),
      price: Number(this.subElements.priceInput.value),
      quantity: Number(this.subElements.quantityInput.value),
      status: Number(this.subElements.statusSelect.value),
      subcategory: this.subElements.subcategorySelect.value,
    };

    return productData;
  }

  onFormSubmit = event => {
    // Отменяем редирект с отправкой формы
    event.preventDefault();

    this.save();
  }

  async save() {
    const productData = this.getProductDataFromElements();

    const requestMethod = this.productId ?
      'PATCH' : 'PUT';
    const response = await fetchJson(this.getProductUrl(), {
      method: requestMethod,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!response) return;
    this.product = response;

    this.generateCustomEvent();
  }

  generateCustomEvent() {
    const eventName = this.productId ?
      'product-updated' : 'product-saved';

    const event = new CustomEvent(eventName, {
      bubbles: true,
      detail: this.product
    });

    this.element.dispatchEvent(event);
  }

  destroy() {
     /**
     * хотя кажется этого не нужно здесь делать т.к. мы удаляем родительский элемент строкой ниже,
     * потомкам которого были навешаны обработчики (?)
     */
    this.removeEventListeners();

    this.remove();
    this.element = '';
  }

  remove() {
    this.element?.remove();
  }

  addSortableContainer() {
    const sortableList = new SortableList({
      items: this.getImageItemsTemplate()
    });

    this.subElements.imageList.append(sortableList.element);
  }

  async render() {
    const element = this.getHTMLNodeFromTemplate(await this.getTemplate());
    const subElements = this.getSubElements(element);

    this.element = element;
    this.subElements = subElements;

    this.addEventListeners();

    this.addSortableContainer();

    return this.element;
  }
}
