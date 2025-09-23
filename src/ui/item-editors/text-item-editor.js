import Pickr from '@simonwep/pickr';
import CanvasRenderer from '../../helpers/canvasRenderer';
import { 
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_BORDER_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_ROTATION,
  DEFAULT_TEXT_COLOR,
  TEXT_ITEM_DEFAULT_COLORS,
  MODE_CREATE,
  TEXT_ITEM_COLOR_PICKER_SELECTORS,
  COLOR_PICKER_OPTIONS,
  DEFAULT_BORDER_WIDTH,
  DEFAULT_FONT_FAMILY,
  DEFAULT_TEXT,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_FONT_STYLE,
  FONT_WEIGHTS,
  FONT_STYLES,
  DEFAULT_PADDING_HORIZONTAL,
  DEFAULT_PADDING_VERTICAL,
  TEXT_FONTS,
  DEFAULT_HORIZONTAL_FLIP,
  DEFAULT_VERTICAL_FLIP
} from '../../constants';
import AbstractItemEditor from './abstract-item-editor';

class TextItemEditor extends AbstractItemEditor {

  constructor() {

    super();

    this.textColorPicker = null;
    this.backgroundColorPicker = null;
    this.borderColorPicker = null;

    this.selector = 'text-item';
    this.editor = document.getElementById(`${this.selector}-editor`);
    this.previewCanvas = document.getElementById(`${this.selector}-preview-canvas`);
    this.canvasRenderer = new CanvasRenderer(this.previewCanvas);

    this._updateOptions();
    this._initializeFormListeners();
    this._updateSubmitButton(); 
  }

  _updateEditorState() {
    super._updateEditorState();
    this._updateInputFieldValues();
  }

  _updateOptions() {
    this.options = {
      text: this.item !== null ? this.item.options.text : DEFAULT_TEXT,
      fontSize: this.item !== null ? this.item.options.fontSize : DEFAULT_FONT_SIZE,
      fontWeight: this.item !== null ? this.item.options.fontWeight : DEFAULT_FONT_WEIGHT,
      fontStyle: this.item !== null ? this.item.options.fontStyle : DEFAULT_FONT_STYLE,
      fontFamily: this.item !== null ? this.item.options.fontFamily : DEFAULT_FONT_FAMILY,
      rotation: this.item !== null ? this.item.options.rotation : DEFAULT_ROTATION,
      textColor: this.item !== null ? this.item.options.textColor : DEFAULT_TEXT_COLOR,
      backgroundColor: this.item !== null ? this.item.options.backgroundColor : DEFAULT_BACKGROUND_COLOR,
      borderColor: this.item !== null ? this.item.options.borderColor : DEFAULT_BORDER_COLOR,
      borderWidth: this.item !== null ? this.item.options.borderWidth : DEFAULT_BORDER_WIDTH,
      paddingX: this.item !== null ? this.item.options.paddingX : DEFAULT_PADDING_HORIZONTAL,
      paddingY: this.item !== null ? this.item.options.paddingY : DEFAULT_PADDING_VERTICAL,
      transforms: {
        flip: {
          x: this.item !== null ? this.item.options.transforms.flip.x : DEFAULT_HORIZONTAL_FLIP,
          y: this.item !== null ? this.item.options.transforms.flip.y : DEFAULT_VERTICAL_FLIP
        }
      },
      mode: this.getMode()
    }
  }

  _updateInputFieldValues() {
    document.getElementById('text-content-field').value = this.options.text;
    document.getElementById('font-family-field').value = this.options.fontFamily;
    document.getElementById('font-size-field').value = this.options.fontSize;
    document.getElementById('font-weight-field').value = this.options.fontWeight;
    document.getElementById('font-style-field').value = this.options.fontStyle;
    document.getElementById('rotation-field').value = this.options.rotation;
    document.getElementById('border-width-field').value = this.options.borderWidth;
    document.getElementById('horizontal-padding-field').value = this.options.paddingX;
    document.getElementById('vertical-padding-field').value = this.options.paddingY;

    this._setControlInputValue('text-horizontal-flip', this.options.transforms.flip.x);
    this._setControlInputValue('text-vertical-flip', this.options.transforms.flip.y);

    this.textColorPicker.setColor(this.options.textColor);
    this.backgroundColorPicker.setColor(this.options.backgroundColor);
    this.borderColorPicker.setColor(this.options.borderColor);
  }

  _initializeFormListeners() {
    super._initializeFormListeners();

    this._initializeContentInputListener();
    this._initializeDropdownListeners();
    this._initializeControlInputListeners();
    this._initializeCheckBoxListeners();

    this.textColorPicker = this._initializeColorPicker('text-color');
    this.backgroundColorPicker = this._initializeColorPicker('background-color');
    this.borderColorPicker = this._initializeColorPicker('border-color');
  }

  _initializeCheckBoxListeners() {
    this._initializeCheckboxListener('text-horizontal-flip');
    this._initializeCheckboxListener('text-vertical-flip');
  }

  _initializeCheckboxListener(selector) {
    const checkbox = document.getElementById(`${selector}-field`);
    checkbox.value = this._getControlInputValue(selector);
    checkbox.addEventListener('change', (e) => {
      this._setControlInputValue(selector, e.target.checked);
      this._updatePreview();
    });
  }

  _initializeColorPickers() {
    for(let selector of TEXT_ITEM_COLOR_PICKER_SELECTORS){
      this._initializeColorPicker(selector);
    }
  }

  _initializeColorPicker(selector) {
    const colorPicker = new Pickr(COLOR_PICKER_OPTIONS[selector]);
    this._initColorPickerSaveListener(colorPicker, selector);
    this._initColorPickerClearListener(colorPicker, selector);
    return colorPicker;
  }

  _initColorPickerSaveListener(colorPicker, type){
    colorPicker.on('save', (color) => {
      this._setColorValue(type, color);
      this._updatePreview();
    });
  }

  _initColorPickerClearListener(colorPicker, type){
    colorPicker.on('clear', () => {
      this._setColorValue(type, TEXT_ITEM_DEFAULT_COLORS[type]);
      this._updatePreview();
    });
  }

  _setColorValue(type, color){
    switch(type){
      case 'text-color':
        this.options.textColor = `#${color.toHEXA().join('')}`;
        break;
      case 'background-color':
        this.options.backgroundColor = `#${color.toHEXA().join('')}`;
        break;
      case 'border-color':
        this.options.borderColor = `#${color.toHEXA().join('')}`;
        break;
    }
  }

  _initializeControlInputListeners() {
    this._initializeControlInputListener('font-size', 1, 100, DEFAULT_FONT_SIZE);
    this._initializeControlInputListener('rotation', 0, 360, DEFAULT_ROTATION);
    this._initializeControlInputListener('border-width', 0, 100, DEFAULT_BORDER_WIDTH);
    this._initializeControlInputListener('horizontal-padding', 0, 100, DEFAULT_PADDING_HORIZONTAL);
    this._initializeControlInputListener('vertical-padding', 0, 100, DEFAULT_PADDING_VERTICAL);
  }

  _initializeControlInputListener(type, minValue = 0, maxValue = 100, defaultValue = 0) {
    const inputField = document.getElementById(`${type}-field`);
    const decrementControl = document.getElementById(`${type}-decrement-button`);
    const incrementControl = document.getElementById(`${type}-increment-button`);

    inputField.addEventListener('input', () => {
      const currentInputValue = inputField.value;
      if(!isNaN(currentInputValue) && currentInputValue !== '') {
        let newValue = parseInt(currentInputValue);
        this._setControlInputValue(type, newValue);
        inputField.value = newValue;
      }
      else {
        this._setControlInputValue(type, defaultValue);
        inputField.value = defaultValue;
      }
      this._updatePreview();
    });

    decrementControl.addEventListener('click', () => {
      const controlValue = this._getControlInputValue(type);
      if(controlValue > minValue){
        this._setControlInputValue(type, controlValue - 1);
        inputField.value = controlValue - 1;
      }
      this._updatePreview();
    });

    incrementControl.addEventListener('click', () => {
      const controlValue = this._getControlInputValue(type);
      if(controlValue < maxValue){
        this._setControlInputValue(type, controlValue + 1);
        inputField.value = controlValue + 1;
      }
      this._updatePreview();
    });
  }

  _initializeContentInputListener() {
    const contentField = document.getElementById('text-content-field');
    contentField.addEventListener('input', () => {
      this.options.text = contentField.value;
      this._updateSubmitButton();
      this._updatePreview();
    });
  }

  _updateSubmitButton() {
    const submitButton = document.getElementById(`${this.selector}-submit-button`);
    if(!this.options.text || this.options.text.trim() === ''){
      submitButton.disabled = true;
    }
    else submitButton.disabled = false;
  }

  _initializeDropdownListeners() {
    this._initializeFontFamilyListeners();
    this._initializeDropdownListener('font-weight', FONT_WEIGHTS);
    this._initializeDropdownListener('font-style', FONT_STYLES);
  }

  _initializeDropdownListener(field, options) {
    const dropdown = document.getElementById(`${field}-field`);
    for(let [value, label] of Object.entries(options)) {
      const optionElement = document.createElement('option');
      optionElement.value = value;
      optionElement.textContent = label;
      dropdown.appendChild(optionElement);
    }

    dropdown.addEventListener('change', () => {
      this._setControlInputValue(field, dropdown.value);
      this._updatePreview();
    });
  }

  _initializeFontFamilyListeners() {
    const validFonts = TEXT_FONTS.map(font => font.name);
    const dropdown = document.getElementById('font-family-field');
    document.fonts.forEach(font => {
      if (validFonts.includes(font.family)) {
        const optionElement = document.createElement('option');
        optionElement.value = font.family;
        optionElement.textContent = font.family;
        dropdown.appendChild(optionElement);
      }
    });

    dropdown.addEventListener('change', () => {
      this._setControlInputValue('font-family', dropdown.value);
      this._updatePreview();
    });
  }

  _getControlInputValue(type) {
    switch(type) {
      case 'text-horizontal-flip':
        return this.options.transforms.flip.x;
      case 'text-vertical-flip':
        return this.options.transforms.flip.y;
      case 'font-family':
        return this.options.fontFamily;
      case 'font-size':
        return this.options.fontSize;
      case 'font-weight':
        return this.options.fontWeight;
      case 'font-style':
        return this.options.fontStyle;
      case 'rotation':
        return this.options.rotation;
      case 'border-width':
        return this.options.borderWidth;
      case 'horizontal-padding':
        return this.options.paddingX;
      case 'vertical-padding':
        return this.options.paddingY;
    }
  }

  _setControlInputValue(type, value) {
    switch(type){
      case 'text-horizontal-flip':
        this.options.transforms.flip.x = value;
        break;
      case 'text-vertical-flip':
        this.options.transforms.flip.y = value;
        break;
      case 'font-family':
        this.options.fontFamily = value;
        break;
      case 'font-size':
        this.options.fontSize = value;
        break;
      case 'font-weight':
        this.options.fontWeight = value;
        break;
      case 'font-style':
        this.options.fontStyle = value;
        break;
      case 'rotation':
        this.options.rotation = value;
        break;
      case 'border-width':
        this.options.borderWidth = value;
        break;
      case 'horizontal-padding':
        this.options.paddingX = value;
        break;
      case 'vertical-padding':
        this.options.paddingY = value;
        break;
    }
  }

  _reset() {
    this.options = {
      text: DEFAULT_TEXT,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontWeight: DEFAULT_FONT_WEIGHT,
      fontStyle: DEFAULT_FONT_STYLE,
      fontSize: DEFAULT_FONT_SIZE,
      rotation: DEFAULT_ROTATION,
      textColor: DEFAULT_TEXT_COLOR,
      backgroundColor: DEFAULT_BACKGROUND_COLOR,
      borderColor: DEFAULT_BORDER_COLOR,
      borderWidth: DEFAULT_BORDER_WIDTH,
      paddingX: DEFAULT_PADDING_HORIZONTAL,
      paddingY: DEFAULT_PADDING_VERTICAL,
      mode: MODE_CREATE,
      transforms: {
        flip: {
          x: DEFAULT_HORIZONTAL_FLIP,
          y: DEFAULT_VERTICAL_FLIP
        }
      }
    }
    this.mode = MODE_CREATE;
  }

  _updatePreview() {
    this.canvasRenderer.draw(this.options);
  }

}

export default TextItemEditor;