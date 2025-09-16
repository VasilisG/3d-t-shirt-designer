import { OBJExporter } from "three/examples/jsm/Addons.js";
import AbstractItemEditor from "./item-editors/abstract-item-editor";

class ModelExporter extends AbstractItemEditor{

  constructor() {
    super();
    this.filename = '';
    this.selector = 'model-exporter';
    this.editor = document.getElementById(`${this.selector}-editor`);
    this.errorMessage = document.getElementById('filename-error-message');
    this.objExporter = new OBJExporter();
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
		const result = this.objExporter.parse(scene);
		this._saveString(result);
    /* Export logic here. */
    /* https://threejs.org/examples/#misc_exporter_obj */
    /* https://github.com/mrdoob/three.js/blob/master/examples/misc_exporter_obj.html#L218 */
  }

  _save(blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = this._getObjFilename();
    link.click();
  }

	_saveString(text) {
    this.save(new Blob([ text ],{ type: 'text/plain' } ), this._getObjFilename());
  }

  _getObjFilename() {
    return `${this.filename.trim()}.obj`;
  }

  _isValidFilename() {
    const regex = /^[0-9a-zA-Z-._]+$/;
    return this.filename.trim() !== '' && regex.test(this.filename);
  }
}

export default ModelExporter;