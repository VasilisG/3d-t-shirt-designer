/**
 * Class for managing items in the T-Shirt Designer
 */
class ItemManager {
  /**
   * Create an item manager
   * @constructor
   */
  constructor() {
    this.items = [];
  }

  /**
   * Add a new item to the manager
   * @param {TextItem|ImageItem} item - The item to be added
   */
  addItem(item) {
    this.items.push(item);
  }

  /**
   * Remove an item from the manager
   * @param {TextItem|ImageItem} item - The item to be removed
   * @returns {Array} The removed item in an array, or undefined if not found
   */
  removeItem(item) {
    const itemIndex = this.items.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      return this.items.splice(itemIndex, 1);
    }
  }

  /**
   * Get an item by its ID
   * @param {string} itemId - The ID of the item to find
   * @returns {TextItem|ImageItem|undefined} The found item or undefined
   */
  getItem(itemId) {
    console.log(this.items.find(item => item.id === itemId));
    return this.items.find(item => item.id === itemId);
  }

  /**
   * Get all items in the manager
   * @returns {Array} Array of all items
   */
  getItems() {
    return this.items;
  }
}

export default ItemManager;