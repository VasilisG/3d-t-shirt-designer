import AbstractFilter from './abstractFilter';

class ColorInvertFilter extends AbstractFilter {

  getValue(options) {
    if (options.image && options.filters && options.filters.colorInvert) {
      const colorInvert = options.filters.colorInvert;
      return colorInvert ? 'invert(1)' : null;
    }
    return null;
  }
}

export default ColorInvertFilter;