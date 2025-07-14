import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import AbstractItem from './abstractItem';
import CanvasRenderer from '../helpers/canvasRenderer';
import pxToWorldUnits from '../utils/pxToWorldUnits';
import { ITEM_IMAGE, ITEM_TEXT } from '../constants';

class TextItem extends AbstractItem {

  static textTotal = 0;

  constructor(intersection, options, preview = false, type = ITEM_TEXT) {

    super();

    TextItem.textTotal++;

    this._intersection = intersection;

    this._size = new THREE.Vector3();

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
    return TextItem.textTotal;
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

  get textureGeometry() {
    return this._textureGeometry;
  }

  set textureGeometry(tg) {
    this._textureGeometry = tg;
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

  _calculateSize() {
    this._size = new THREE.Vector3(
      pxToWorldUnits(this._canvas.width),
      pxToWorldUnits(this._canvas.height),
      1
    );
  }

  _createCanvasTexture(options) {
    this._canvas = document.createElement('canvas');
    this._canvas.id = `text-item-${TextItem.textTotal}`;

    const type = options.image ? ITEM_IMAGE : ITEM_TEXT;

    const canvasRenderer = new CanvasRenderer(this._canvas, type);
    canvasRenderer.draw(options);
  
    this._texture = new THREE.CanvasTexture(this._canvas);
    this._texture.center.set(0.5, 0.5);
  }

  _createTextureMaterial(preview) {
    this._textureMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: preview ? 0.5 : 1,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4
    });
  }

  _createTextureGeometry(intersection) {
    this._textureGeometry = new DecalGeometry(
      intersection.object,
      intersection.point,
      intersection.normal,
      this._size
    );
  }

  _createTextureMesh(intersection, options, preview) {
    this._createCanvasTexture(options);
    this._calculateSize();
    this._createTextureMaterial(preview);
    this._createTextureGeometry(intersection);
    this._textureMesh = new THREE.Mesh(
      this._textureGeometry,
      this._textureMaterial
    );
  }

  update(options) {
    this._options = options;
    this._createCanvasTexture(options);
    this._calculateSize();
    this._createTextureMaterial(false);
    this._textureGeometry.dispose();
    this._createTextureGeometry(this._intersection);
    this._textureMesh.geometry = this._textureGeometry;
    this._textureMesh.material = this._textureMaterial;
  }

  updatePosition(intersection) {
    this._textureGeometry.dispose();
    this._createTextureGeometry(intersection);
    this._textureMesh.geometry = this._textureGeometry;
  }
}

export default TextItem;