import * as THREE from 'three';
import { generateUUID } from "three/src/math/MathUtils.js";
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import CanvasRenderer from '../helpers/canvasRenderer';
import pxToWorldUnits from '../utils/pxToWorldUnits';
import { ITEM_IMAGE, ITEM_TEXT, MODE_CREATE, MODE_UPDATE } from '../constants';

class Item {

  static totalItems = 0;

  constructor(intersection, options, preview = false, type = ITEM_TEXT) {

    Item.totalItems++;

    this.id = generateUUID();

    this._intersection = intersection;
    this._size = new THREE.Vector3();
    this._position = new THREE.Vector3();
    this._options = options;
    this._type = type;

    this._canvas = null;
    this._texture = null;
    this._textureMaterial = null;
    this._textureGeometry = null;
    this._textureMesh = null;

    this._createTextureMesh(intersection, options, preview);
  }

  static total() {
    return Item.totalItems;
  }

  getId() {
    return this.id;
  }

  get options() {
    return this._options;
  }

  get texture() {
    return this._texture;
  }

  set texture(t) {
    this._texture = t;
  }

  get textureMaterial() {
    return this._textureMaterial;
  }

  set textureMaterial(tm) {
    this._textureMaterial = tm;
  }

  get textureMesh() {
    return this._textureMesh;
  }

  set textureMesh(tm) {
    this._textureMesh = tm;
  }

  getType() {
    return this._type;
  }

  getCanvas() {
    return this._canvas;
  }

  getIntersection() {
    return this._intersection;
  }

  _createCanvasTexture(options) {
    this._canvas = document.createElement('canvas');
    this._canvas.id = `text-item-${Item.totalItems}`;

    const type = options.image ? ITEM_IMAGE : ITEM_TEXT;

    const canvasRenderer = new CanvasRenderer(this._canvas, type);
    canvasRenderer.draw(options);

    this._size = new THREE.Vector3(
      pxToWorldUnits(this._canvas.width),
      pxToWorldUnits(this._canvas.height),
      0.1
    );
  
    this._texture = new THREE.CanvasTexture(this._canvas);
    this._texture.colorSpace = THREE.SRGBColorSpace;
    this._texture.magFilter = THREE.NearestFilter;
    this._texture.minFilter = THREE.NearestFilter;
    this._texture.generateMipmaps = false;
    this._texture.needsUpdate = true;
    this._texture.center.set(0.5, 0.5);
  }

  _createTextureMaterial(preview) {
    this._textureMaterial = new THREE.MeshStandardMaterial({
      map: this.texture,
      transparent: true,
      opacity: preview ? 0.5 : 1,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      side: THREE.FrontSide,
      alphaTest: 0.1,
      envMap: null
    });
  }

  _createTextureGeometry(options = null, intersection) {

    if(options === null || options.mode === MODE_CREATE){
      this._position.copy(intersection.point);
    }

    this._textureGeometry = new DecalGeometry(
      intersection.object,
      this._position,
      intersection.normal,
      this._size
    );
  }

  _createTextureMesh(intersection, options, preview) {
    this._createCanvasTexture(options);
    this._createTextureMaterial(preview);
    this._createTextureGeometry(options, intersection);
    this._textureMesh = new THREE.Mesh(
      this._textureGeometry,
      this._textureMaterial
    );
  }

  update(options) {
    this._options = options;
    this._createCanvasTexture(options);
    this._createTextureMaterial(false);
    this._textureGeometry.dispose();
    this._createTextureGeometry(options, this._intersection);
    this._textureMesh.geometry = this._textureGeometry;
    this._textureMesh.material = this._textureMaterial;
  }

  updatePosition(intersection) {
    this._textureGeometry.dispose();
    this._createTextureGeometry(null, intersection);
    this._textureMesh.geometry = this._textureGeometry;
  }
}

export default Item;