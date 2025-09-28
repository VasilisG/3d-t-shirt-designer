import * as THREE from 'three';
import { generateUUID } from "three/src/math/MathUtils.js";
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import CanvasRenderer from '../helpers/canvasRenderer';
import pxToWorldUnits from '../utils/pxToWorldUnits';
import { ITEM_IMAGE, ITEM_TEXT, MODE_CREATE, MODE_UPDATE } from '../constants';

/**
 * Class representing an item (text or image) in the T-Shirt Designer
 */
class Item {

  static totalItems = 0;

  /**
   * Create an item
   * @constructor
   * @param {Object} intersection - The 3D intersection point data
   * @param {Object} options - The item options (text, image, colors, etc.)
   * @param {boolean} [preview=false] - Whether this is a preview item
   * @param {string} [type=ITEM_TEXT] - The type of item (ITEM_TEXT or ITEM_IMAGE)
   */
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

  /**
   * Get the total number of items created
   * @static
   * @returns {number} The total number of items
   */
  static total() {
    return Item.totalItems;
  }

  /**
   * Get the unique ID of this item
   * @returns {string} The item's unique identifier
   */
  getId() {
    return this.id;
  }

  /**
   * Get the item options
   * @returns {Object} The item's options object
   */
  get options() {
    return this._options;
  }

  /**
   * Get the item's texture
   * @returns {THREE.Texture} The item's texture
   */
  get texture() {
    return this._texture;
  }

  /**
   * Set the item's texture
   * @param {THREE.Texture} t - The texture to set
   */
  set texture(t) {
    this._texture = t;
  }

  /**
   * Get the item's texture material
   * @returns {THREE.Material} The item's material
   */
  get textureMaterial() {
    return this._textureMaterial;
  }

  /**
   * Set the item's texture material
   * @param {THREE.Material} tm - The material to set
   */
  set textureMaterial(tm) {
    this._textureMaterial = tm;
  }

  /**
   * Get the item's texture mesh
   * @returns {THREE.Mesh} The item's mesh
   */
  get textureMesh() {
    return this._textureMesh;
  }

  /**
   * Set the item's texture mesh
   * @param {THREE.Mesh} tm - The mesh to set
   */
  set textureMesh(tm) {
    this._textureMesh = tm;
  }

  /**
   * Get the type of this item
   * @returns {string} The item type (ITEM_TEXT or ITEM_IMAGE)
   */
  getType() {
    return this._type;
  }

  /**
   * Get the item's canvas element
   * @returns {HTMLCanvasElement} The item's canvas
   */
  getCanvas() {
    return this._canvas;
  }

  /**
   * Get the item's intersection data
   * @returns {Object} The intersection point data
   */
  getIntersection() {
    return this._intersection;
  }

  /**
   * Create the canvas texture from the provided options
   * @private
   * @param {Object} options - The rendering options
   */
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

  /**
   * Create the texture material
   * @private
   * @param {boolean} preview - Whether this is for preview mode
   */
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

  /**
   * Create the decal geometry for the texture
   * @private
   * @param {Object|null} [options=null] - The creation options
   * @param {Object} intersection - The intersection data
   */
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

  /**
   * Create the complete texture mesh from canvas, material, and geometry
   * @private
   * @param {Object} intersection - The intersection data
   * @param {Object} options - The item options
   * @param {boolean} preview - Whether this is for preview mode
   */
  _createTextureMesh(intersection, options, preview) {
    this._createCanvasTexture(options);
    this._createTextureMaterial(preview);
    this._createTextureGeometry(options, intersection);
    this._textureMesh = new THREE.Mesh(
      this._textureGeometry,
      this._textureMaterial
    );
  }

  /**
   * Update the item with new options
   * @param {Object} options - The new options to apply
   */
  update(options) {
    this._options = options;
    this._createCanvasTexture(options);
    this._createTextureMaterial(false);
    this._textureGeometry.dispose();
    this._createTextureGeometry(options, this._intersection);
    this._textureMesh.geometry = this._textureGeometry;
    this._textureMesh.material = this._textureMaterial;
  }

  /**
   * Update the item's position based on new intersection data
   * @param {Object} intersection - The new intersection data
   */
  updatePosition(intersection) {
    this._textureGeometry.dispose();
    this._createTextureGeometry(null, intersection);
    this._textureMesh.geometry = this._textureGeometry;
  }
}

export default Item;