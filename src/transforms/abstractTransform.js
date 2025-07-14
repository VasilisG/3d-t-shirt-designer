class AbstractTransform {

  apply(ctx, options) {
    throw new Error("Method 'apply' must be implemented.");
  }
}

export default AbstractTransform;