import { ITEM_IMAGE, ITEM_TEXT, SCALE_FACTOR } from "../constants";
import ColorInvertFilter from "../filters/colorInvertFilter";
import GrayscaleFilter from "../filters/grayscaleFilter";
import HueFilter from "../filters/hueFilter";
import SaturationFilter from "../filters/saturationFilter";
import BrightnessFilter from "../filters/brightnessFilter";
import ContrastFilter from "../filters/contrastFilter";
import FlipTransform from "../transforms/flipTransform";

class CanvasRenderer {

  constructor(canvas, type = ITEM_TEXT) {
    this.canvas = canvas;
    this.ctx = null;
    if(this.canvas){
      this.ctx = this.canvas.getContext('2d');
    }
    else throw new Error(`Canvas element with id '${canvasId}' does not exist.`);

    this.transforms = [];
    this.filters = [];

    if(type === ITEM_IMAGE){
      this._initializeTransforms();
      this._initializeFilters();
    }
  }

  _initializeTransforms() {
    this.transforms = {
      flip: new FlipTransform()
    };
  }

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

  getCanvas() {
    return this.canvas;
  }

  draw(options) {
    this._clear();
    if(options){
      this._setupCanvas(options);
      this._drawItem(options);
    }
  }

  _drawItem(options) {
    if(options.image){
      this._drawImageItem(options);
    }
    else this._drawTextItem(options);
  }

  _drawTextItem(options) {
    this._rotate(options);
    this._drawBackground(options);
    this._drawText(options);
    this._drawBorder(options);
  }

  _drawImageItem(options) {
    this._applyFilters(options);
    this._drawImage(options);
    this._applyTransforms(options);
  }

  _drawImage(options) {
    this.ctx.drawImage(options.image, 0, 0, options.image.width * SCALE_FACTOR, options.image.height * SCALE_FACTOR);
    this.ctx.save();
  }

  _applyTransforms(options) {
    if(options.transforms){
      for(const transformKey of Object.keys(options.transforms)){
        console.log(transformKey);
        if(this.transforms[transformKey]){
          console.log(this.transforms[transformKey]);
          this.transforms[transformKey].apply(this.ctx, options);
        }
      }
    }
  }

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

  _clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  _setupCanvas(options) {
    if(options.image) {
      this._setupCanvasForImage(options);
    }
    else this._setupCanvasForText(options);
  }

  _setupCanvasForText(options) {
    const { text, fontSize, fontWeight, fontStyle, fontFamily, paddingX, paddingY } = options;
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    const textSize = this.ctx.measureText(text);
    this.ctx.canvas.width = (textSize.width + 2 * paddingX) * SCALE_FACTOR;
    this.ctx.canvas.height = (textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent + 2 * paddingY) * SCALE_FACTOR;
  }

  _setupCanvasForImage(options) {
    this.ctx.canvas.width = options.image.width * SCALE_FACTOR;
    this.ctx.canvas.height = options.image.height * SCALE_FACTOR;
  }

  _drawBackground(options) {
    const { backgroundColor } = options;
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

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

  _drawBorder(options) {
    const { borderColor, borderWidth } = options;
    if(borderWidth > 0){
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = borderWidth;
      this.ctx.strokeRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }

  _rotate(options) {
    const { rotation } = options;
    this.canvas.style.transform = `rotate(${rotation}deg)`;
  }
}

export default CanvasRenderer;