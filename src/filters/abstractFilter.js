class AbstractFilter {

  getValue(options) {
    throw new Error("Method 'geValue' must be implemented.");
  }
}

export default AbstractFilter;