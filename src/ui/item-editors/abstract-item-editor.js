import { MODE_CREATE, MODE_UPDATE } from "../../constants";

/**
 * Base abstract class for item editors, providing common editor functionality
 * for different types of items (text, image, etc.)
 */
class AbstractItemEditor {

  /**
   * Creates a new AbstractItemEditor with default properties
   */
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

    this.popupOverlay = document.getElementById('popup-overlay');
  }

  /**
   * Returns the current editor mode based on whether an item is being edited
   * @returns {string} MODE_CREATE if creating a new item, MODE_UPDATE if updating existing
   */
  getMode() {
    return this.item === null ? MODE_CREATE : MODE_UPDATE;
  }

  /**
   * Sets the current item for editing and updates editor state
   * @param {object} item - The item to be edited
   */
  setItem(item) {
    this.item = item;
    this.mode = this.getMode();
    this._updateEditorState();
  }

  /**
   * Gets the current item being edited
   * @returns {object|null} The current item, or null if creating a new item
   */
  getItem() {
    return this.item;
  }

  /**
   * Opens the editor dialog and updates its state
   */
  open() {
    this.editor.classList.add('popup-visible');
    this.popupOverlay.classList.add('popup-overlay-enabled');
    this.mode = this.getMode();
    this._updateEditorState();
  }

  /**
   * Closes the editor dialog and emits appropriate events
   * @param {string} type - The close action type ('success', 'cancel', or 'close')
   */
  close(type) {
    this.editor.classList.remove('popup-visible');
    this.popupOverlay.classList.remove('popup-overlay-enabled');
    this._emitDialog(type);
    this._reset();
  }

  /**
   * Registers a callback for successful dialog completion
   * @param {Function} callback - Function to call when dialog succeeds
   */
  onDialogSuccess(callback) {
    this.dialogSuccessCallbacks.push(callback);
  }

  /**
   * Registers a callback for dialog cancellation
   * @param {Function} callback - Function to call when dialog is cancelled
   */
  onDialogCancel(callback) {
    this.dialogCancelCallbacks.push(callback);
  }

  /**
   * Registers a callback for dialog close action
   * @param {Function} callback - Function to call when dialog is closed
   */
  onDialogClose(callback) {
    this.dialogCloseCallbacks.push(callback);
  }

  /**
   * Emits appropriate dialog events based on close type
   * @param {string} type - The close action type ('success', 'cancel', or 'close')
   * @private
   */
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

  /**
   * Emits success events to all registered callbacks with current options
   * @private
   */
  _emitDialogSuccess() {
    this.dialogSuccessCallbacks.forEach(callback => callback(this.options));
  }

  /**
   * Emits cancel events to all registered callbacks
   * @private
   */
  _emitDialogCancel() {
    this.dialogCancelCallbacks.forEach(callback => callback());
  }

  /**
   * Emits close events to all registered callbacks
   * @private
   */
  _emitDialogClose() {
    this.dialogCloseCallbacks.forEach(callback => callback());
  }

  /**
   * Initializes all form action listeners
   * @protected
   */
  _initializeFormListeners() {
    this._initializeCloseActionListener();
    this._initializeSuccessActionListener();
    this._initializeCancelActionListener();
  }

  /**
   * Initializes the close button event listener
   * @private
   */
  _initializeCloseActionListener() {
    const closeButton = document.getElementById(`${this.selector}-editor-close-button`);
    closeButton.addEventListener('click', () => {
      this.close('close');
    });
  }

  /**
   * Initializes the submit button event listener
   * @private
   */
  _initializeSuccessActionListener() {
    const successButton = document.getElementById(`${this.selector}-submit-button`);
    successButton.addEventListener('click', () => {
      this.close('success');
    });
  }

  /**
   * Initializes the cancel button event listener
   * @private
   */
  _initializeCancelActionListener() {
    const cancelButton = document.getElementById(`${this.selector}-cancel-button`);
    cancelButton.addEventListener('click', () => {
      this.close('cancel');
    });
  }

  /**
   * Updates the editor state by refreshing options, preview and buttons
   * @protected
   */
  _updateEditorState() {
    this._updateOptions();
    this._updatePreview();
    this._updateSubmitButton();
  }

  /**
   * Updates the submit button state based on validation
   * @protected
   */
  _updateSubmitButton() {
    return;
  }

  /**
   * Updates the editor options based on current state
   * @protected
   */
  _updateOptions() {
    this.options = {};
  }

  /**
   * Updates the canvas preview with current options
   * @protected
   */
  _updatePreview() {
    if(this.canvasRenderer !== null) {
      this.canvasRenderer.draw(this.options);
    }
  }

  /**
   * Resets the editor state to defaults
   * @protected
   */
  _reset() {
    this.options = null;
  }
}

export default AbstractItemEditor;