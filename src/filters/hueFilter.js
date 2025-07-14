import AbstractFilter from "./abstractFilter";

class HueFilter extends AbstractFilter {

  getValue(options) {
    if (options.image && options.filters && options.filters.hue) {
      const hue = options.filters.hue;
      return `hue-rotate(${hue}deg)`;
    }
    return null;
  }
}

export default HueFilter;