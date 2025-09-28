import { Raycaster } from "three";

/**
 * Class representing an item selector for the T-Shirt Designer
 */
class ItemSelector {

  /**
   * Create an item selector
   * @constructor
   */
  constructor() {
    this.focusedItem = null;
    this.selectedItem = null;
    this.raycaster = new Raycaster();
  }

  /**
   * Get the focused item under the mouse pointer using raycasting
   * @param {ItemManager} itemManager - The item manager containing all items
   * @param {THREE.Vector2} pointer - The normalized pointer coordinates
   * @param {THREE.Camera} camera - The camera for raycasting
   * @returns {Item|null} The focused item or null if none found
   */
  getFocusedItem(itemManager, pointer, camera) {
    this.focusedItem = null;
    this.raycaster.setFromCamera(pointer, camera);
    for(let item of itemManager.getItems()) {
      let intersects = this.raycaster.intersectObject(item.textureMesh, false);
      if(intersects.length > 0) {
        this.focusedItem = item;
        break;
      }
    }
    return this.focusedItem;
  }

  /**
   * Select the currently focused item
   */
  selectItem() {
    this.selectedItem = this.focusedItem;
  }

  /**
   * Get the currently selected item
   * @returns {Item|null} The selected item or null if none selected
   */
  getSelectedItem() {
    return this.selectedItem;
  }

  /**
   * Deselect the currently selected item
   */
  deselectItem() {
    this.selectedItem = null;
  }
}

export default ItemSelector;