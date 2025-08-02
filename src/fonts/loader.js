import { TEXT_FONTS } from "../constants";

/**
 * Class representing a font loader for the T-Shirt Designer
 */
class FontLoader {

  /**
   * Create a font loader
   * @constructor
   */
  constructor() {
    this.fonts = [];
    this.eventCallback = null;
    this.errorCallback = null;
  }

  /**
   * Get all loaded fonts
   * @returns {Array} Array of loaded font items
   */
  getFonts() {
    return this.fonts;
  }

  /**
   * Load all fonts from the TEXT_FONTS constant
   * @async
   */
  async loadFonts() {
    for(let fontItem of TEXT_FONTS) {
      await this._loadFont(fontItem);
    }
  }

  /**
   * Load a single font
   * @private
   * @async
   * @param {Object} fontItem - The font item containing name and url properties
   */
  async _loadFont(fontItem) {
    const fontFace = new FontFace(fontItem.name, `url(${fontItem.url})`);
    const fontResult = await fontFace.load();
    if(fontResult.status === 'loaded'){
      document.fonts.add(fontFace);
      this.fonts.push(fontItem);
      this._emitLoadEvent(fontItem);
    }
    if(fontResult.status === 'error') {
      this._emitErrorEvent(fontItem);
    }
  }

  /**
   * Emit font loaded event
   * @private
   * @param {Object} fontItem - The font item that was loaded
   */
  _emitLoadEvent(fontItem) {
    if (this.eventCallback) {
      this.eventCallback(fontItem);
    }
  }

  /**
   * Emit font error event
   * @private
   * @param {Object} fontItem - The font item that failed to load
   */
  _emitErrorEvent(fontItem) {
    if (this.errorCallback) {
      this.errorCallback(fontItem);
    }
  }

  /**
   * Register callback for font loaded events
   * @param {Function} callback - Callback function to execute when a font is loaded
   */
  onFontLoaded(callback) {
    this.eventCallback = callback;
  }

  /**
   * Register callback for font error events
   * @param {Function} callback - Callback function to execute when a font fails to load
   */
  onFontError(callback) {
    this.errorCallback = callback;
  }
}

export default FontLoader;