/**
 * Class representing an action button in the T-Shirt Designer
 */
class Action {
  /**
   * Create an action
   * @constructor
   * @param {string} actionElementId - The DOM element ID for this action
   * @param {string} state - The state associated with this action
   * @throws {Error} If element with provided ID is not found
   */
  constructor(actionElementId, state) {
    this.state = state;
    this.element = document.getElementById(actionElementId);
    if (!this.element) {
      throw new Error(`Element with ID ${actionElementId} not found.`);
    }
  }

  /**
   * Add click event listener to the action element
   * @param {Function} callback - The callback function to execute on click
   */
  onClick(callback) {
    this.element.addEventListener('click', () => {
      callback();
    });
  }

  /**
   * Set the state of the action
   * @param {string} state - The new state to set
   */
  setState(state){
    this.state = state;
  }

  /**
   * Get the current state of the action
   * @returns {string} The current state
   */
  getState(){
    return this.state;
  }

  /**
   * Update the visual status of the action based on current state
   * @param {string} currentState - The current application state
   */
  updateStatus(currentState){
    if(this.state === currentState) {
      this.element.classList.add('active');
    }
    else this.element.classList.remove('active');
  }
}

export default Action;