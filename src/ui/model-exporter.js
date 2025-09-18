import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import AbstractItemEditor from "./item-editors/abstract-item-editor";

class ModelExporter extends AbstractItemEditor {

  constructor() {
    super();
    this.filename = '';
    this.selector = 'model-exporter';
    this.editor = document.getElementById(`${this.selector}-editor`);
    this.errorMessage = document.getElementById('filename-error-message');
    this.gltfExporter = new GLTFExporter();
    this._initializeFormListeners();
  }

  _initializeFormListeners() {
    super._initializeFormListeners();
    this._initializeFilenameInputListener();
  }

  _initializeFilenameInputListener() {
    const contentField = document.getElementById('filename-field');
    contentField.addEventListener('input', () => {
      this.filename = contentField.value;
      this._updateSubmitButton();
      this._updatePreview();
    });
  }

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

  _save(blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = this._getFilename();
    link.click();
  }

	_saveString(text) {
    this._save(new Blob([ text ],{ type: 'text/plain' } ), this._getFilename());
  }

  _getFilename() {
    return `${this.filename.trim()}.gltf`;
  }

  _isValidFilename() {
    const regex = /^[0-9a-zA-Z-._]+$/;
    return this.filename.trim() !== '' && regex.test(this.filename);
  }
}

export default ModelExporter;