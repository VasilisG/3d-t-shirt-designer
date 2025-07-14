import AbstractFilter from './abstractFilter';

class GrayscaleFilter extends AbstractFilter {

  getValue(options) {
    if (options.image && options.filters && options.filters.grayscale) {
      const grayscale = options.filters.grayscale;
      return grayscale ? 'grayscale(1)' : null;
    }
    return null;
  }
}

export default GrayscaleFilter;