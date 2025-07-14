import AbstractFilter from "./abstractFilter";

class BrightnessFilter extends AbstractFilter {

  getValue(options) {
    if (options.image && options.filters && options.filters.brightness !== null) {
      const brightness = options.filters.brightness;
      return `brightness(${brightness})`;
    }
    return null;
  }
}

export default BrightnessFilter;