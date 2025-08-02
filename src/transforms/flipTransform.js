import AbstractTransform from "./abstractTransform";

class FlipTransform extends AbstractTransform {

  apply(ctx, options) {
    if(options && options.image && options.transforms.flip) {
      const { image } = options;
      const horizontalFlip = options.transforms.flip.x ? -1 : 1;
      const verticalFlip = options.transforms.flip.y ? -1 : 1;

      const startX = horizontalFlip < 0 ? -image.width : 0;
      const startY = verticalFlip < 0 ? -image.height : 0;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.save();
      ctx.scale(horizontalFlip, verticalFlip);
      
      ctx.drawImage(image, 
        startX, 
        startY, 
        image.width, 
        image.height);
      ctx.restore();
    }
  }
}

export default FlipTransform;