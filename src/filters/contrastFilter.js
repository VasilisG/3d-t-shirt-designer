import AbstractFilter from "./abstractFilter";

class ContrastFilter extends AbstractFilter {

  getValue(options) {
    if (options.image && options.filters && options.filters.contrast !== null) {
      const contrast = options.filters.contrast;
      return `contrast(${contrast})`;
    }
    return null;
  }
}

export default ContrastFilter;