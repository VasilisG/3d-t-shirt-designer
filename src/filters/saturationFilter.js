import AbstractFilter from "./abstractFilter";

class SaturationFilter extends AbstractFilter {

  getValue(options) {
    if (options.image && options.filters && options.filters.saturation !== null) {
      const saturation = options.filters.saturation;
      return `saturate(${saturation})`;
    }
    return null;
  }
}

export default SaturationFilter;