import { PIXELS_PER_UNIT } from "../constants";

/**
 * Converts pixel size to world units
 * @param {number} pxSize - The size in pixels to convert
 * @param {number} [pixelsPerUnit=PIXELS_PER_UNIT] - The number of pixels per world unit
 * @returns {number} The size in world units
 */
const pxToWorldUnits = (pxSize, pixelsPerUnit = PIXELS_PER_UNIT) => {
  return pxSize / pixelsPerUnit;
}

export default pxToWorldUnits;