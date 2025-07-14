import { generateUUID } from "three/src/math/MathUtils.js";

class AbstractItem {
  
  static totalItems = 0;

  constructor() {
    AbstractItem.totalItems++;
    this.id = generateUUID();
  }

  static totalItems() {
    return AbstractItem.totalItems;
  }

  getId() {
    return this.id;
  }
}

export default AbstractItem;