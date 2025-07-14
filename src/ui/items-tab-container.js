import { ITEM_TEXT, ITEM_IMAGE, ITEM_LIST_TAB_IDS } from "../constants";

class ItemsTabContainer {

  constructor(activeTabId = ITEM_LIST_TAB_IDS[0]) {
    this.tabButtons = [];
    this.tabItems = [];
    this.deleteItemCallback = null;
    this.editItemCallback = null;
    this._initialize(activeTabId);
  }

  _initialize(activeTabId) {
    this._initializeTabButtons();
    this._initializeTabItems();
    this.switchToTab(activeTabId);
  }

  _initializeTabButtons() {
    this.tabButtons = {};
    for(const tabId of ITEM_LIST_TAB_IDS) {
      this.tabButtons[tabId] = document.getElementById(tabId);
      this.tabButtons[tabId].addEventListener('click', () => {
        this.switchToTab(tabId);
      });
    }
  }

  _initializeTabItems() {
    this.tabItems = {};
    for(const tabId of ITEM_LIST_TAB_IDS) {
      this.tabItems[tabId] = document.querySelector(`[data-tab-id=${tabId}]`);
    }
  }

  switchToTab(id) {
    this._switchTabButton(id);
    this._switchTabItem(id);
  }

  _switchTabButton(id) {
    for(let [tabId, tabButton] of Object.entries(this.tabButtons)){
      if(tabId === id) {
        tabButton.classList.add('active');
      } else {
        tabButton.classList.remove('active');
      }
    }
  }

  _switchTabItem(id) {
    for(let [tabId, tabItem] of Object.entries(this.tabItems)){
      if(tabId === id) {
        tabItem.classList.add('active');
      } else {
        tabItem.classList.remove('active');
      }
    }
  }

  _clearTabItems() {
    for(let tabId of Object.keys(this.tabItems)){
      this.tabItems[tabId].innerHTML = '';
    }
  }

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

  _createTabListItem(buttons, canvasContainer) {
    const tabListItem = document.createElement('div');
    tabListItem.classList.add('tab-list-item');
    tabListItem.appendChild(buttons);
    tabListItem.appendChild(canvasContainer);
    return tabListItem;
  }

  _addTabListItem(parent, item) {
    const tabListItemButtons = this._createTabListButtons(item);
    const itemCanvasContainer = this._createItemCanvas(item);
    const tabListItem = this._createTabListItem(tabListItemButtons, itemCanvasContainer);
    parent.appendChild(tabListItem);
  }

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

  onItemDelete(callback) {
    this.deleteItemCallback = callback;
  }

  onItemEdit(callback) {
    this.editItemCallback = callback;
  }

  _emitItemDelete(item) {
    if(this.deleteItemCallback) {
      this.deleteItemCallback(item);
    }
  }

  _emitItemEdit(item) {
    if(this.editItemCallback) {
      this.editItemCallback(item);
    }
  }
}

export default ItemsTabContainer;