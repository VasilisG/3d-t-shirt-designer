/**
 * Class representing an action button in the T-Shirt Designer
 */
class Action {
  /**
   * Create an action
   * @constructor
   * @param {string} actionElementId - The DOM element ID for this action
   * @param {Array} states - The state associated with this actions
   * @throws {Error} If element with provided ID is not found
   */
  constructor(actionElementId, states) {
    this.states = states;
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
   * @param {Array} states - The new state to set
   */
  setStates(states){
    this.states = states;
  }

  /**
   * Get the current state of the action
   * @returns {Array} The current state
   */
  getStates(){
    return this.states;
  }

  /**
   * Update the visual status of the action based on current state
   * @param {string} currentState - The current application state
   */
  updateStatus(currentState){
    if(this.states.includes(currentState)) {
      this.element.classList.add('active');
    }
    else this.element.classList.remove('active');
  }
}

export default Action;