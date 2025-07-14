/**
 * Class representing a menu of actions for the T-Shirt Designer
 */
class ActionMenu {
  /**
   * Create an action menu
   * @constructor
   */
  constructor() {
    this.actions = [];
  }

  /**
   * Add a new action to the menu
   * @param {Action} action - The action to be added to the menu
   */
  addAction(action){
    this.actions.push(action);
  }

  /**
   * Update the status of all menu items based on current state
   * @param {string} currentState - The current state of the application
   */
  updateMenuItemStatus(currentState){
    this.actions.forEach(action => {
      action.updateStatus(currentState);
    });
  }
}

export default ActionMenu;