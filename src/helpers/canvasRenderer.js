import { ITEM_TEXT, MAX_HEIGHT, MAX_WIDTH, SCALE_FACTOR } from "../constants";
import ColorInvertFilter from "../filters/colorInvertFilter";
import GrayscaleFilter from "../filters/grayscaleFilter";
import HueFilter from "../filters/hueFilter";
import SaturationFilter from "../filters/saturationFilter";
import BrightnessFilter from "../filters/brightnessFilter";
import ContrastFilter from "../filters/contrastFilter";
import FlipTransform from "../transforms/flipTransform";

/**
 * Class representing a canvas renderer for the T-Shirt Designer
 */
class CanvasRenderer {

  /**
   * Create a canvas renderer
   * @constructor
   * @param {HTMLCanvasElement} canvas - The canvas element to render on
   * @param {string} [type=ITEM_TEXT] - The type of item to render (ITEM_TEXT or ITEM_IMAGE)
   * @throws {Error} If canvas element is null or undefined
   */
  constructor(canvas, type = ITEM_TEXT) {
    this.canvas = canvas;
    this.ctx = null;
    if(this.canvas){
      this.ctx = this.canvas.getContext('2d');
    }
    else throw new Error(`Canvas element with id '${canvasId}' does not exist.`);

    this.transforms = [];
    this.filters = [];

    this._initializeTransforms();
    this._initializeFilters();
  }

  /**
   * Initialize available transforms for image items
   * @private
   */
  _initializeTransforms() {
    this.transforms = {
      flip: new FlipTransform()
    };
  }

  /**
   * Initialize available filters for image items
   * @private
   */
  _initializeFilters() {
    this.filters = {
      colorInvert: new ColorInvertFilter(),
      grayscale: new GrayscaleFilter(),
      hue: new HueFilter(),
      saturation: new SaturationFilter(),
      brightness: new BrightnessFilter(),
      contrast: new ContrastFilter()
    };
  }

  /**
   * Get the canvas element
   * @returns {HTMLCanvasElement} The canvas element
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Draw item on canvas with the provided options
   * @param {Object} options - The drawing options containing item properties
   */
  draw(options) {
    this._clear();
    if(options){
      this._setupCanvas(options);
      this._drawItem(options);
    }
  }

  /**
   * Draw item based on its type (text or image)
   * @private
   * @param {Object} options - The drawing options
   */
  _drawItem(options) {
    if(options.image){
      this._drawImageItem(options);
    }
    else {
      this._drawTextItem(options);
    }
  }

  /**
   * Draw a text item with background, text, and border
   * @private
   * @param {Object} options - The text drawing options
   */
  _drawTextItem(options) {
    this._rotate(options);
    this._drawBackground(options);
    this._drawText(options);
    this._strokeText(options);
    this._drawBorder(options);
    this._applyTransforms(options);
  }

  /**
   * Draw an image item with filters and transforms
   * @private
   * @param {Object} options - The image drawing options
   */
  _drawImageItem(options) {
    this._applyFilters(options);
    this._drawImage(options);
    this._applyTransforms(options);
  }

  /**
   * Draw the image on the canvas
   * @private
   * @param {Object} options - The image drawing options
   */
  _drawImage(options) {
    this.ctx.drawImage(options.image, 0, 0, options.image.width, options.image.height, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
  }

  /**
   * Apply transforms to the image
   * @private
   * @param {Object} options - The drawing options containing transform settings
   */
  _applyTransforms(options) {
    if(options.transforms){
      for(const transformKey of Object.keys(options.transforms)){
        if(this.transforms[transformKey]){
          this.transforms[transformKey].apply(this.ctx, options);
        }
      }
    }
  }

  /**
   * Apply filters to the canvas context
   * @private
   * @param {Object} options - The drawing options containing filter settings
   */
  _applyFilters(options) {
    const filtersToApply = [];
    if(options.filters){
      for(const filterKey of Object.keys(options.filters)){
        if(this.filters[filterKey]){
          const filterValue = this.filters[filterKey].getValue(options);
          if(filterValue) {
            filtersToApply.push(filterValue);
          }
        }
      }
    }
    this.ctx.filter = filtersToApply.join(' ');
  }

  /**
   * Clear the entire canvas
   * @private
   */
  _clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  /**
   * Setup canvas dimensions and properties based on item type
   * @private
   * @param {Object} options - The drawing options
   */
  _setupCanvas(options) {
    if(options.image) {
      this._setupCanvasForImage(options);
    }
    else this._setupCanvasForText(options);
  }

  /**
   * Setup canvas for text item rendering
   * @private
   * @param {Object} options - The text drawing options
   */
  _setupCanvasForText(options) {
    const { text, fontSize, fontWeight, fontStyle, fontFamily, paddingX, paddingY, strokeWidth } = options;
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    const textSize = this.ctx.measureText(text);
    this.ctx.canvas.width = (textSize.width + 2 * paddingX + 2 * strokeWidth) * SCALE_FACTOR;
    this.ctx.canvas.height = (textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent + 2 * paddingY) * SCALE_FACTOR;
  }

  /**
   * Setup canvas for image item rendering
   * @private
   * @param {Object} options - The image drawing options
   */
  _setupCanvasForImage(options) {
    const scaleFactor = Math.min(1, Math.min(MAX_WIDTH / options.image.width, MAX_HEIGHT / options.image.height));

    this.ctx.canvas.width = options.image.width * scaleFactor;
    this.ctx.canvas.height = options.image.height * scaleFactor;
  }

  /**
   * Draw background rectangle with specified color
   * @private
   * @param {Object} options - The drawing options containing backgroundColor
   */
  _drawBackground(options) {
    const { backgroundColor } = options;
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  /**
   * Draw text with specified font and color properties
   * @private
   * @param {Object} options - The text drawing options
   */
  _drawText(options) {
    const { text, fontSize, fontWeight, fontStyle, fontFamily, textColor } = options;
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize * SCALE_FACTOR}px ${fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = textColor;
    this.ctx.fillText(
      text, 
      this.ctx.canvas.width / 2, 
      this.ctx.canvas.height / 2
    );
  }

  /**
   * Stroke text with specified stroke color and width
   * @private
   * @param {Object} options - The text stroking options. 
   */
  _strokeText(options) {
    const { text, fontSize, fontWeight, fontStyle, fontFamily, strokeColor, strokeWidth } = options;
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize * SCALE_FACTOR}px ${fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = strokeWidth * SCALE_FACTOR;
    this.ctx.strokeText(
      text,
      this.ctx.canvas.width / 2,
      this.ctx.canvas.height / 2
    );
  }

  /**
   * Draw border around the canvas if border width is greater than 0
   * @private
   * @param {Object} options - The drawing options containing border properties
   */
  _drawBorder(options) {
    const { borderColor, borderWidth } = options;
    if(borderWidth > 0){
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = borderWidth;
      this.ctx.strokeRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }

  /**
   * Apply rotation transform to the canvas element
   * @private
   * @param {Object} options - The drawing options containing rotation value
   */
  _rotate(options) {
    const { rotation } = options;
    this.canvas.style.transform = `rotate(${rotation}deg)`;
  }
}

export default CanvasRenderer;