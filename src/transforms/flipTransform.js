import { SCALE_FACTOR } from "../constants";
import AbstractTransform from "./abstractTransform";

class FlipTransform extends AbstractTransform {

  apply(ctx, options) {
    if(options && options.transforms.flip) {
      const horizontalFlip = options.transforms.flip.x ? -1 : 1;
      const verticalFlip = options.transforms.flip.y ? -1 : 1;

      const startX = horizontalFlip < 0 ? -ctx.canvas.width : 0;
      const startY = verticalFlip < 0 ? -ctx.canvas.height : 0;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.save();
      ctx.scale(horizontalFlip, verticalFlip);

      if(options.text) {
        const { text, fontSize, fontWeight, fontStyle, fontFamily, textColor, backgroundColor, borderColor, borderWidth } = options;

        ctx.font = `${fontStyle} ${fontWeight} ${fontSize * SCALE_FACTOR}px ${fontFamily}`;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = textColor;
        ctx.fillText(
          text, 
          (ctx.canvas.width * horizontalFlip) / 2, 
          (ctx.canvas.height * verticalFlip) / 2
        );

        if(borderWidth > 0){
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderWidth;
          ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
      }

      if(options.image) {
        const { image } = options;
        ctx.drawImage(image, 0, 0, image.width, image.height, startX, startY, ctx.canvas.width, ctx.canvas.height);
      }

      ctx.restore();
    }
  }
}

export default FlipTransform;