import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import AbstractItemEditor from "./item-editors/abstract-item-editor";

/**
 * Class representing a 3D model exporter for the T-Shirt Designer
 */
class ModelExporter extends AbstractItemEditor {

  /**
   * Create a model exporter
   * @constructor
   */
  constructor() {
    super();
    this.filename = '';
    this.selector = 'model-exporter';
    this.editor = document.getElementById(`${this.selector}-editor`);
    this.errorMessage = document.getElementById('filename-error-message');
    this.gltfExporter = new GLTFExporter();
    this._initializeFormListeners();
  }

  /**
   * Initialize all form listeners
   * @private
   */
  _initializeFormListeners() {
    super._initializeFormListeners();
    this._initializeFilenameInputListener();
  }

  /**
   * Initialize filename input field listener
   * @private
   */
  _initializeFilenameInputListener() {
    const contentField = document.getElementById('filename-field');
    contentField.addEventListener('input', () => {
      this.filename = contentField.value;
      this._updateSubmitButton();
      this._updatePreview();
    });
  }

  /**
   * Update submit button state based on filename validity
   * @private
   */
  _updateSubmitButton() {
    const submitButton = document.getElementById(`${this.selector}-submit-button`);
    if(this._isValidFilename()) {
      submitButton.disabled = false;
      this.errorMessage.classList.remove('visible');
    } else {
      submitButton.disabled = true;
      this.errorMessage.classList.add('visible');
    }
  }

  /**
   * Export the 3D scene to a GLTF file
   * @param {THREE.Scene} scene - The 3D scene to export
   */
  exportScene(scene) {
    this.gltfExporter.parse(scene, (result) => {
      const output = JSON.stringify(result, null, 2);
      this._saveString(output);
    });

    /* Export logic here. */
    /* https://threejs.org/examples/#misc_exporter_obj */
    /* https://github.com/mrdoob/three.js/blob/master/examples/misc_exporter_obj.html#L218 */

    /* GTLF export alternative */
    /* https://github.com/mrdoob/three.js/blob/master/examples/misc_exporter_gltf.html */
  }

  /**
   * Save a blob as a downloadable file
   * @private
   * @param {Blob} blob - The blob to save
   */
  _save(blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = this._getFilename();
    link.click();
  }

  /**
   * Save a string as a downloadable text file
   * @private
   * @param {string} text - The text content to save
   */
	_saveString(text) {
    this._save(new Blob([ text ],{ type: 'text/plain' } ), this._getFilename());
  }

  /**
   * Get the formatted filename with .gltf extension
   * @private
   * @returns {string} The complete filename with extension
   */
  _getFilename() {
    return `${this.filename.trim()}.gltf`;
  }

  /**
   * Validate if the filename contains only allowed characters
   * @private
   * @returns {boolean} True if filename is valid, false otherwise
   */
  _isValidFilename() {
    const regex = /^[0-9a-zA-Z-._]+$/;
    return this.filename.trim() !== '' && regex.test(this.filename);
  }
}

export default ModelExporter;