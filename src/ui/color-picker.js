import Pickr from '@simonwep/pickr';
import { 
  COLOR_PICKER_COMPONENTS, 
  COLOR_PICKER_DEFAULT_COLOR, 
  COLOR_PICKER_ELEMENT_SELECTOR, 
  COLOR_PICKER_THEME 
} from '../constants';

/**
 * Class representing a color picker for the T-Shirt Designer
 */
class ColorPicker {
  /**
   * Create a color picker
   * @constructor
   * @param {THREE.Mesh} modelMesh - The 3D mesh to apply colors to
   */
  constructor(modelMesh) {
    this.modelMesh = modelMesh;
    this.picker = this._initializePicker();
    this._initListeners();
  }

  /**
   * Initialize the color picker instance
   * @private
   * @returns {Pickr} The initialized Pickr instance
   */
  _initializePicker() { 
    return new Pickr({
      el: COLOR_PICKER_ELEMENT_SELECTOR,
      theme: COLOR_PICKER_THEME,
      default: COLOR_PICKER_DEFAULT_COLOR,
      components: COLOR_PICKER_COMPONENTS
    });
  }

  /**
   * Initialize all event listeners
   * @private
   */
  _initListeners() {
    this._initSaveListener();
    this._initClearListener();
  }

  /**
   * Initialize the save event listener
   * @private
   */
  _initSaveListener(){
    this.picker.on('save', (color) => {
      this._updateMeshMaterialColor(color)
    });
  }

  /**
   * Initialize the clear event listener
   * @private
   */
  _initClearListener(){
    this.picker.on('clear', () => {
      this._updateMeshMaterialColor(COLOR_PICKER_DEFAULT_COLOR, false);
    });
  }

  /**
   * Update the mesh material color
   * @private
   * @param {(Pickr.HSVaColor|string)} color - The color to set
   * @param {boolean} [convertToHex=true] - Whether to convert the color to hex format
   */
  _updateMeshMaterialColor(color, convertToHex=true) {
    if(color){
      let hexColor = color;
      if(convertToHex){
        hexColor = `#${color.toHEXA().join('')}`;
      }
      this.modelMesh.material.color.set(hexColor);
    }
  }
}

export default ColorPicker;