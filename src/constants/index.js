export const PIXELS_PER_UNIT = 1024;
export const SCALE_FACTOR = 1;

/* Item types. */
export const ITEM_TEXT = 'item-text';
export const ITEM_IMAGE = 'item-image';


/* Item fonts. */
export const TEXT_FONTS = [
  {
    name: 'Roboto',
    url: '/assets/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf'
  },
  {
    name: 'Roboto Italic',
    url: '/assets/fonts/Roboto/Roboto-Italic-VariableFont_wdth,wght.ttf'
  }
];

/* Global color picker options. */
export const COLOR_PICKER_THEME = 'monolith';
export const COLOR_PICKER_COMPONENTS = {
  preview: true,
  opacity: false,
  hue: true,
  interaction: {
    hex: true,
    input: true,
    clear: true,
    save: true
  }
}

/* T-shirt color picker options. */
export const COLOR_PICKER_ELEMENT_SELECTOR = '#action-color';
export const COLOR_PICKER_DEFAULT_COLOR = '#fff';

/* Text item default options. */
export const MODE_CREATE = 'create';
export const MODE_UPDATE = 'update';

export const TEXT_COLOR_ELEMENT_SELECTOR = '#text-color';
export const BACKGROUND_COLOR_ELEMENT_SELECTOR = '#background-color';
export const BORDER_COLOR_ELEMENT_SELECTOR = '#border-color';

export const DEFAULT_FONT_FAMILY = 'Roboto';
export const DEFAULT_FONT_SIZE = 14;
export const DEFAULT_FONT_WEIGHT = '400';
export const DEFAULT_FONT_STYLE = 'normal';
export const DEFAULT_ROTATION = 0;
export const DEFAULT_TEXT = '';
export const DEFAULT_TEXT_COLOR = '#000';
export const DEFAULT_BACKGROUND_COLOR = '#fff';
export const DEFAULT_BORDER_COLOR = '#fff';
export const DEFAULT_BORDER_WIDTH = 0;
export const DEFAULT_PADDING = 0;
export const DEFAULT_PADDING_HORIZONTAL = 0;
export const DEFAULT_PADDING_VERTICAL = 0;

export const FONT_WEIGHTS = {
  '100': 'Thin',
  '200': 'Extra Light',
  '300': 'Light',
  '400': 'Normal',
  '500': 'Medium',
  '600': 'Semi Bold',
  '700': 'Bold',
  '800': 'Extra Bold',
  '900': 'Black'
};

export const FONT_STYLES = {
  normal: 'Normal',
  italic: 'Italic'
};

export const TEXT_ITEM_COLOR_PICKER_SELECTORS = [
  'text-color', 
  'background-color', 
  'border-color'
];

export const TEXT_ITEM_DEFAULT_COLORS = {
  'text-color': DEFAULT_TEXT_COLOR,
  'background-color': DEFAULT_BACKGROUND_COLOR,
  'border-color': DEFAULT_BORDER_COLOR
};

export const COLOR_PICKER_OPTIONS = {
  'text-color': {
    el: TEXT_COLOR_ELEMENT_SELECTOR,
    theme: COLOR_PICKER_THEME,
    default: DEFAULT_TEXT_COLOR,
    components: COLOR_PICKER_COMPONENTS
  },
  'background-color': {
    el: BACKGROUND_COLOR_ELEMENT_SELECTOR,
    theme: COLOR_PICKER_THEME,
    default: DEFAULT_BACKGROUND_COLOR,
    components: COLOR_PICKER_COMPONENTS
  },
  'border-color': {
    el: BORDER_COLOR_ELEMENT_SELECTOR,
    theme: COLOR_PICKER_THEME,
    default: DEFAULT_BORDER_COLOR,
    components: COLOR_PICKER_COMPONENTS
  }
};

/* Image item default options. */
export const DEFAULT_HORIZONTAL_FLIP = false;
export const DEFAULT_VERTICAL_FLIP = false;
export const DEFAULT_COLOR_INVERT = false;
export const DEFAULT_GRAYSCALE = false;
export const DEFAULT_HUE = 0.0;
export const DEFAULT_SATURATION = 1.0;
export const DEFAULT_BRIGHTNESS = 1.0;
export const DEFAULT_CONTRAST = 1.0;

export const HUE_MIN_VALUE = 0;
export const HUE_MAX_VALUE = 360;
export const HUE_STEP = 1;

export const SATURATION_MIN_VALUE = 0.0;
export const SATURATION_MAX_VALUE = 4.0;
export const SATURATION_STEP = 0.01;

export const BRIGHTNESS_MIN_VALUE = 0.0;
export const BRIGHTNESS_MAX_VALUE = 4.0;
export const BRIGHTNESS_STEP = 0.01;

export const CONTRAST_MIN_VALUE = 0.0;
export const CONTRAST_MAX_VALUE = 4.0;
export const CONTRAST_STEP = 0.01;

/* Item list variables. */
export const ITEM_LIST_TAB_IDS = [
  'items-tab-text',
  'items-tab-image'
];

/* Item actions */
export const ACTION_SELECT = 'action-select';
export const ACTION_TEXT = 'action-text';
export const ACTION_IMAGE = 'action-image';
export const ACTION_EXPORT = 'action-export';

/* App states. */
export const STATES = Object.freeze({
  SELECT: Symbol('select'),
  PLACE: Symbol('place'),
  TEXT_CREATE: Symbol('text-insert'),
  TEXT_EDIT: Symbol('text-edit'),
  IMAGE_CREATE: Symbol('image-insert'),
  IMAGE_EDIT: Symbol('image-edit'),
  COLOR_EDIT: Symbol('color-edit'),
  EXPORT: Symbol('export')
});

/* Cursor states. */
export const CURSOR_STATES = Object.freeze({
  AUTO: 'auto',
  POINTER: 'pointer',
});