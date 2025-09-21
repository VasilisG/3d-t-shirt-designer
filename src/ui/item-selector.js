import { Raycaster } from "three";

class ItemSelector {

  constructor() {
    this.focusedItem = null;
    this.selectedItem = null;
    this.raycaster = new Raycaster();
  }

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

  selectItem() {
    this.selectedItem = this.focusedItem;
  }

  getSelectedItem() {
    return this.selectedItem;
  }

  deselectItem() {
    this.selectedItem = null;
  }
}

export default ItemSelector;