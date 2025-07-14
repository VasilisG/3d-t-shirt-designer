import { 
  BRIGHTNESS_MAX_VALUE,
  BRIGHTNESS_MIN_VALUE,
  BRIGHTNESS_STEP,
  CONTRAST_MAX_VALUE,
  CONTRAST_MIN_VALUE,
  CONTRAST_STEP,
  DEFAULT_BRIGHTNESS, 
  DEFAULT_COLOR_INVERT, 
  DEFAULT_CONTRAST, 
  DEFAULT_GRAYSCALE, 
  DEFAULT_HORIZONTAL_FLIP, 
  DEFAULT_HUE, 
  DEFAULT_SATURATION, 
  DEFAULT_VERTICAL_FLIP, 
  HUE_MAX_VALUE, 
  HUE_MIN_VALUE, 
  HUE_STEP, 
  ITEM_IMAGE, 
  MODE_CREATE,
  SATURATION_MAX_VALUE,
  SATURATION_MIN_VALUE,
  SATURATION_STEP,
} from "../../constants";
import CanvasRenderer from "../../helpers/canvasRenderer";
import AbstractItemEditor from "./abstract-item-editor";

class ImageItemEditor extends AbstractItemEditor {

  constructor() {
    super();
    this.selector = 'image-item';
    this.editor = document.getElementById(`${this.selector}-editor`);
    this.previewCanvas = document.getElementById(`${this.selector}-preview-canvas`);
    this.canvasRenderer = new CanvasRenderer(this.previewCanvas, ITEM_IMAGE);
    this._updateOptions();
    this._initializeFormListeners();
  }

  _updateOptions() {
    this.options = {
      image: this.item !== null ? this.item.options.image : null,
      transforms: {
        flip: {
          x: this.item !== null ? this.item.options.transforms.flip.x : DEFAULT_HORIZONTAL_FLIP,
          y: this.item !== null ? this.item.options.transforms.flip.y : DEFAULT_VERTICAL_FLIP
        }
      },
      filters: {
        colorInvert: this.item !== null ? this.item.options.filters.colorInvert : DEFAULT_COLOR_INVERT,
        grayscale: this.item !== null ? this.item.options.filters.grayscale : DEFAULT_GRAYSCALE,
        hue: this.item !== null ? this.item.options.filters.hue : DEFAULT_HUE,
        saturation: this.item !== null ? this.item.options.filters.saturation : DEFAULT_SATURATION,
        brightness: this.item !== null ? this.item.options.filters.brightness : DEFAULT_BRIGHTNESS,
        contrast: this.item !== null ? this.item.options.filters.contrast : DEFAULT_CONTRAST
      }
    }
  }

  _updateInputFieldValues() {
    this._setControlInputValue('horizontal-flip', this.options.transforms.flip.x);
    this._setControlInputValue('vertical-flip', this.options.transforms.flip.y);
    this._setControlInputValue('color-invert', this.options.filters.colorInvert);
    this._setControlInputValue('grayscale', this.options.filters.grayscale);
    this._setControlInputValue('hue', this.options.filters.hue);
    this._setControlInputValue('saturation', this.options.filters.saturation);
    this._setControlInputValue('brightness', this.options.filters.brightness);
    this._setControlInputValue('contrast', this.options.filters.contrast);
  }

  _reset() {
    this.options = {
      image: null,
      transforms: {
        flip: {
          x: DEFAULT_HORIZONTAL_FLIP,
          y: DEFAULT_VERTICAL_FLIP
        }
      },
      filters: {
        colorInvert: DEFAULT_COLOR_INVERT,
        grayscale: DEFAULT_GRAYSCALE,
        hue: DEFAULT_HUE,
        saturation: DEFAULT_SATURATION,
        brightness: DEFAULT_BRIGHTNESS,
        contrast: DEFAULT_CONTRAST
      }
    }
    this.mode = MODE_CREATE;
  }

  _initializeFormListeners() {
    super._initializeFormListeners();
    this._initializeImageUploadListener();
    this._initializeCheckBoxListeners();
    this._initializeRangeListeners();
  }

  _initializeCheckBoxListeners() {
    this._initializeCheckboxListener('horizontal-flip');
    this._initializeCheckboxListener('vertical-flip');
    this._initializeCheckboxListener('color-invert');
    this._initializeCheckboxListener('grayscale');
  }

  _initializeCheckboxListener(selector) {
    const checkbox = document.getElementById(`${selector}-field`);
    checkbox.value = this._getControlInputValue(selector);
    checkbox.addEventListener('change', (e) => {
      this._setControlInputValue(selector, e.target.checked);
      this._updatePreview();
    });
  }

  _initializeRangeListeners() {
    this._initializeRangeListener('hue', HUE_MIN_VALUE, HUE_MAX_VALUE, HUE_STEP);
    this._initializeRangeListener('saturation', SATURATION_MIN_VALUE, SATURATION_MAX_VALUE, SATURATION_STEP);
    this._initializeRangeListener('brightness', BRIGHTNESS_MIN_VALUE, BRIGHTNESS_MAX_VALUE, BRIGHTNESS_STEP);
    this._initializeRangeListener('contrast', CONTRAST_MIN_VALUE, CONTRAST_MAX_VALUE, CONTRAST_STEP);
  }

  _initializeRangeListener(selector, minValue, maxValue, step) {
    const rangeInput = document.getElementById(`${selector}-field`);
    rangeInput.value = this._getControlInputValue(selector);
    rangeInput.min = minValue;
    rangeInput.max = maxValue;
    rangeInput.step = step;

    rangeInput.addEventListener('input', (e) => {
      this._setControlInputValue(selector, parseFloat(e.target.value));
      this._updatePreview();
    });
  }

  _initializeImageUploadListener() {
    const imageUploader = document.getElementById('image-uploader');
    const fileInput = document.getElementById('image-uploader-field');

    imageUploader.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      if(fileInput.files.length === 1){
        const file = fileInput.files[0];
        if (file && file.type.startsWith('image/')) {
          this._readFile(file);
        } else {
          console.error('Please upload a valid image file.');
        }
      }
      else console.error('Please upload only one image file.');
      fileInput.value = '';
    });
  }

  _readFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const image = new Image();
      image.src = e.target.result;
      image.onload = () => {
        this.options.image = image;
        this.options.image.width = image.width;
        this.options.image.height = image.height;
        this._updatePreview();
      };
      image.onerror = (error) => {
        console.error('Error loading image:', error);
      }
    };

    reader.readAsDataURL(file);

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    }
  }

    _getControlInputValue(type) {
      switch(type) {
        case 'horizontal-flip':
          return this.options.transforms.flip.x;
        case 'vertical-flip':
          return this.options.transforms.flip.y;
        case 'color-invert':
          return this.options.filters.colorInvert;
        case 'grayscale':
          return this.options.filters.grayscale;
        case 'hue':
          return this.options.filters.hue;
        case 'saturation':
          return this.options.filters.saturation;
        case 'brightness':
          return this.options.filters.brightness;
        case 'contrast':
          return this.options.filters.contrast;
      }
    }

  _setControlInputValue(type, value) {
    switch(type){
      case 'horizontal-flip':
        this.options.transforms.flip.x = value;
        break;
      case 'vertical-flip':
        this.options.transforms.flip.y = value;
        break;
      case 'color-invert':
        this.options.filters.colorInvert = value;
        break;
      case 'grayscale':
        this.options.filters.grayscale = value;
        break;
      case 'hue':
        this.options.filters.hue = value;
        break;
      case 'saturation':
        this.options.filters.saturation = value;
        break;
      case 'brightness':
        this.options.filters.brightness = value;
        break;
      case 'contrast':
        this.options.filters.contrast = value;
        break;
    }
  }

  _updateEditorState() {
    this._updateOptions();
    this._updateInputFieldValues();
    this._updatePreview();
  }
}

export default ImageItemEditor;