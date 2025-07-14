import { TEXT_FONTS } from "../constants";

class FontLoader {

  constructor() {
    this.fonts = [];
    this.eventCallback = null;
    this.errorCallback = null;
  }

  getFonts() {
    return this.fonts;
  }

  async loadFonts() {
    for(let fontItem of TEXT_FONTS) {
      await this._loadFont(fontItem);
    }
  }

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

  _emitLoadEvent(fontItem) {
    if (this.eventCallback) {
      this.eventCallback(fontItem);
    }
  }

  _emitErrorEvent(fontItem) {
    if (this.errorCallback) {
      this.errorCallback(fontItem);
    }
  }

  onFontLoaded(callback) {
    this.eventCallback = callback;
  }

  onFontError(callback) {
    this.errorCallback = callback;
  }
}

export default FontLoader;