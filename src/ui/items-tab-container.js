import { ITEM_TEXT, ITEM_IMAGE, ITEM_LIST_TAB_IDS } from "../constants";

/**
 * Class representing a tab container for managing items in the T-Shirt Designer
 */
class ItemsTabContainer {

  /**
   * Create an items tab container
   * @constructor
   * @param {string} [activeTabId=ITEM_LIST_TAB_IDS[0]] - The ID of the initially active tab
   */
  constructor(activeTabId = ITEM_LIST_TAB_IDS[0]) {
    this.tabButtons = [];
    this.tabItems = [];
    this.deleteItemCallback = null;
    this.editItemCallback = null;
    this._initialize(activeTabId);
  }

  /**
   * Initialize the tab container with the specified active tab
   * @private
   * @param {string} activeTabId - The ID of the tab to activate
   */
  _initialize(activeTabId) {
    this._initializeTabButtons();
    this._initializeTabItems();
    this.switchToTab(activeTabId);
  }

  /**
   * Initialize all tab buttons and add event listeners
   * @private
   */
  _initializeTabButtons() {
    this.tabButtons = {};
    for(const tabId of ITEM_LIST_TAB_IDS) {
      this.tabButtons[tabId] = document.getElementById(tabId);
      this.tabButtons[tabId].addEventListener('click', () => {
        this.switchToTab(tabId);
      });
    }
  }

  /**
   * Initialize all tab items by finding their DOM elements
   * @private
   */
  _initializeTabItems() {
    this.tabItems = {};
    for(const tabId of ITEM_LIST_TAB_IDS) {
      this.tabItems[tabId] = document.querySelector(`[data-tab-id=${tabId}]`);
    }
  }

  /**
   * Switch to the specified tab
   * @param {string} id - The ID of the tab to switch to
   */
  switchToTab(id) {
    this._switchTabButton(id);
    this._switchTabItem(id);
  }

  /**
   * Update the active state of tab buttons
   * @private
   * @param {string} id - The ID of the tab button to activate
   */
  _switchTabButton(id) {
    for(let [tabId, tabButton] of Object.entries(this.tabButtons)){
      if(tabId === id) {
        tabButton.classList.add('active');
      } else {
        tabButton.classList.remove('active');
      }
    }
  }

  /**
   * Update the active state of tab items
   * @private
   * @param {string} id - The ID of the tab item to activate
   */
  _switchTabItem(id) {
    for(let [tabId, tabItem] of Object.entries(this.tabItems)){
      if(tabId === id) {
        tabItem.classList.add('active');
      } else {
        tabItem.classList.remove('active');
      }
    }
  }

  /**
   * Clear all content from tab items
   * @private
   */
  _clearTabItems() {
    for(let tabId of Object.keys(this.tabItems)){
      this.tabItems[tabId].innerHTML = '';
    }
  }

  /**
   * Create action buttons (edit and delete) for a tab list item
   * @private
   * @param {Object} item - The item to create buttons for
   * @returns {HTMLElement} The container element with action buttons
   */
  _createTabListButtons(item) {
    const tabListButtons = document.createElement('div');
    tabListButtons.classList.add('tab-list-buttons');

    const tabListItemEditButton = this._createTabListButton(
      ['tab-list-item-action-button', 'tab-list-item-edit-button'], 
      ['tab-list-item-action-image', 'tab-list-item-edit-image'], 
      'assets/icons/edit.svg', 'Edit'
    );
    tabListItemEditButton.addEventListener('click', () => {
      this._emitItemEdit(item);
    });

    const tabListItemDeleteButton = this._createTabListButton(
      ['tab-list-item-action-button', 'tab-list-item-delete-button'],
      ['tab-list-item-action-image', 'tab-list-item-delete-image'],
      'assets/icons/delete.svg', 'Delete'
    );
    tabListItemDeleteButton.addEventListener('click', () => {
      this._emitItemDelete(item);
    });

    tabListButtons.appendChild(tabListItemEditButton);
    tabListButtons.appendChild(tabListItemDeleteButton);
    return tabListButtons;
  }

  /**
   * Create a single action button with icon
   * @private
   * @param {string[]} classList - CSS classes for the button
   * @param {string[]} imageClassList - CSS classes for the button image
   * @param {string} imageSrc - Source URL for the button icon
   * @param {string} altText - Alt text for the button icon
   * @returns {HTMLElement} The created button element
   */
  _createTabListButton(classList, imageClassList, imageSrc, altText){
    const button = document.createElement('button');
    const image = document.createElement('img');

    button.classList.add(...classList);
    image.classList.add(...imageClassList);
    image.src = imageSrc;
    image.alt = altText;

    button.appendChild(image);
    return button;
  }

  /**
   * Create a canvas element displaying the item's visual representation
   * @private
   * @param {Object} item - The item to create canvas for
   * @returns {HTMLElement} The canvas container element
   */
  _createItemCanvas(item) {
    const itemCanvasContainer = document.createElement('div');
    itemCanvasContainer.classList.add('tab-list-item-canvas-container');

    const itemCanvas = document.createElement('canvas');
    itemCanvas.classList.add('tab-list-item-canvas');
    itemCanvas.width = item.getCanvas().width;
    itemCanvas.height = item.getCanvas().height;
    const itemContext = itemCanvas.getContext('2d');
    itemContext.drawImage(item.getCanvas(), 0, 0);

    itemCanvasContainer.appendChild(itemCanvas);

    return itemCanvasContainer;
  }

  /**
   * Create a complete tab list item with buttons and canvas
   * @private
   * @param {HTMLElement} buttons - The action buttons container
   * @param {HTMLElement} canvasContainer - The canvas container
   * @returns {HTMLElement} The complete tab list item element
   */
  _createTabListItem(buttons, canvasContainer) {
    const tabListItem = document.createElement('div');
    tabListItem.classList.add('tab-list-item');
    tabListItem.appendChild(buttons);
    tabListItem.appendChild(canvasContainer);
    return tabListItem;
  }

  /**
   * Add a tab list item to the specified parent container
   * @private
   * @param {HTMLElement} parent - The parent container to add the item to
   * @param {Object} item - The item to add
   */
  _addTabListItem(parent, item) {
    const tabListItemButtons = this._createTabListButtons(item);
    const itemCanvasContainer = this._createItemCanvas(item);
    const tabListItem = this._createTabListItem(tabListItemButtons, itemCanvasContainer);
    parent.appendChild(tabListItem);
  }

  /**
   * Update all tab items with the provided items array
   * @param {Object[]} items - Array of items to display in tabs
   */
  updateTabItems(items) {
    this._clearTabItems();
    for(let item of items){
      switch(item.getType()) {
        case ITEM_TEXT:
          this._addTabListItem(this.tabItems[ITEM_LIST_TAB_IDS[0]], item);
          break;
        case ITEM_IMAGE:
          this._addTabListItem(this.tabItems[ITEM_LIST_TAB_IDS[1]], item);
          break;
      }
    }
  }

  /**
   * Register callback for item delete events
   * @param {Function} callback - Callback function to execute when item is deleted
   */
  onItemDelete(callback) {
    this.deleteItemCallback = callback;
  }

  /**
   * Register callback for item edit events
   * @param {Function} callback - Callback function to execute when item is edited
   */
  onItemEdit(callback) {
    this.editItemCallback = callback;
  }

  /**
   * Emit item delete event
   * @private
   * @param {Object} item - The item to delete
   */
  _emitItemDelete(item) {
    if(this.deleteItemCallback) {
      this.deleteItemCallback(item);
    }
  }

  /**
   * Emit item edit event
   * @private
   * @param {Object} item - The item to edit
   */
  _emitItemEdit(item) {
    if(this.editItemCallback) {
      this.editItemCallback(item);
    }
  }

  /**
   * Toggle the visibility of the items tab container
   */
  toggleVisibility() {
    const container = document.querySelector('.items-list-container');
    container.classList.toggle('items-list-container-hidden');
  }
}

export default ItemsTabContainer;