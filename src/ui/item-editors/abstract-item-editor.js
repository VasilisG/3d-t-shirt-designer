import { MODE_CREATE, MODE_UPDATE } from "../../constants";

class AbstractItemEditor {

  constructor() {

    this.mode = MODE_CREATE;

    this.options = {};

    this.item = null;

    this.dialogSuccessCallbacks = [];
    this.dialogCancelCallbacks = [];
    this.dialogCloseCallbacks = [];

    this.selector = null;
    this.editor = null;
    this.canvasRenderer = null;
  }

  getMode() {
    return this.item === null ? MODE_CREATE : MODE_UPDATE;
  }

  setItem(item) {
    this.item = item;
    this.mode = this.getMode();
    this._updateEditorState();
  }

  getItem() {
    return this.item;
  }

  open() {
    this.editor.classList.add('popup-visible');
    this.mode = this.getMode();
    this._updateEditorState();
  }

  close(type) {
    this.editor.classList.remove('popup-visible');
    this._emitDialog(type);
    this._reset();
  }

  onDialogSuccess(callback) {
    this.dialogSuccessCallbacks.push(callback);
  }

  onDialogCancel(callback) {
    this.dialogCancelCallbacks.push(callback);
  }

  onDialogClose(callback) {
    this.dialogCloseCallbacks.push(callback);
  }

  _emitDialog(type) {
    switch(type){
      case 'success':
        this._emitDialogSuccess(this.options);
        break;
      case 'cancel':
        this._emitDialogCancel();
        break;
      case 'close':
        this._emitDialogClose();
        break;
    }
  }

  _emitDialogSuccess() {
    this.dialogSuccessCallbacks.forEach(callback => callback(this.options));
  }

  _emitDialogCancel() {
    this.dialogCancelCallbacks.forEach(callback => callback());
  }

  _emitDialogClose() {
    this.dialogCloseCallbacks.forEach(callback => callback());
  }

  _initializeFormListeners() {
    this._initializeCloseActionListener();
    this._initializeSuccessActionListener();
    this._initializeCancelActionListener();
  }

  _initializeCloseActionListener() {
    const closeButton = document.getElementById(`${this.selector}-editor-close-button`);
    closeButton.addEventListener('click', () => {
      this.close('close');
    });
  }

  _initializeSuccessActionListener() {
    const successButton = document.getElementById(`${this.selector}-submit-button`);
    successButton.addEventListener('click', () => {
      this.close('success');
    });
  }

  _initializeCancelActionListener() {
    const cancelButton = document.getElementById(`${this.selector}-cancel-button`);
    cancelButton.addEventListener('click', () => {
      this.close('cancel');
    });
  }

  _updateEditorState() {
    this._updateOptions();
    this._updatePreview();
    this._updateSubmitButton();
  }

  _updateSubmitButton() {
    return;
  }

  _updateOptions() {
    this.options = {};
  }

  _updatePreview() {
    this.canvasRenderer.draw(this.options);
  }

  _reset() {
    this.options = null;
  }
}

export default AbstractItemEditor;