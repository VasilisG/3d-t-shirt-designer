/**
 * Class representing a loading bar for the T-Shirt Designer
 */
class LoadingBar {
  /**
   * Create a loading bar
   * @constructor
   */
  constructor() {
    this.loadingBarContainer = document.getElementById('loading-bar-container');
    this.loadingProgress = document.getElementById('loading-progress');
    this.loadingMessage = document.getElementById('loading-message');
  }

  /**
   * Update the loading progress and message
   * @param {number} value - The progress value (0-100)
   * @param {string} [message='Loading'] - The loading message to display
   */
  updateProgress(value, maxValue, message = 'Loading') {
    this.loadingMessage.textContent = message;
    this.loadingProgress.value = value;
    this.loadingProgress.max = maxValue;
    this.loadingProgress.textContent = `${Math.round((value / maxValue) * 100)}%`;
  }

  /**
   * Show the loading bar by adding the enabled class
   */
  show() {
    this.loadingBarContainer.classList.add('loading-bar-container-enabled');
  }

  /**
   * Hide the loading bar by removing the enabled class
   */
  hide() {
    this.loadingBarContainer.classList.remove('loading-bar-container-enabled');
  }
}

export default LoadingBar;