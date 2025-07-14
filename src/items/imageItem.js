import AbstractItem from "./abstractItem";

class ImageItem extends AbstractItem {
   
  static imageTotal = 0;

  constructor(intersection, options, preview = false) {

    super();

    ImageItem.imageTotal++;

    this._intersection = intersection;

    this._size = new THREE.Vector3();

    this._options = options;

    this._canvas = null;
    this._texture = null;
    this._textureMaterial = null;
    this._textureGeometry = null;
    this._textureMesh = null;

    this._createTextureMesh(intersection, options, preview);

  }
}

export default ImageItem;