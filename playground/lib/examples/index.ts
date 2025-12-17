import { ShowcaseExample } from './types';
import { basicShapesExample } from './basic-shapes';
import { gradientsExample } from './gradients';
import { radialGradientExample } from './radial-gradient';
import { gradientStrokeExample } from './gradient-stroke';
import { strokeExample } from './stroke';
import { pathExample } from './path';
import { fillRuleExample } from './fill-rule';
import { fillSpreadExample } from './fill-spread';
import { opacityExample } from './opacity';
import { sceneExample } from './scene';
import { sceneTransformExample } from './scene-transform';
import { clippingExample } from './clipping';
import { duplicateExample } from './duplicate';
import { boundingBoxExample } from './bounding-box';
import { transformStaticExample } from './transform-static';
import { transformAnimationExample } from './transform-animation';
import { textStaticExample } from './text-static';
import { textAnimationExample } from './text-animation';
import { pictureSvgExample } from './picture-svg';
import { pictureJpgExample } from './picture-jpg';
import { picturePngExample } from './picture-png';
import { pictureWebpExample } from './picture-webp';
import { lottieAnimationExample } from './lottie-animation';
import { trimPathExample } from './trim-path';
import { imageRotationExample } from './image-rotation';
import { imageScalingExample } from './image-scaling';
import { sceneBlendingExample } from './scene-blending';
import { strokeLineExample } from './stroke-line';
import { gradientTransformExample } from './gradient-transform';
import { viewportExample } from './viewport';
import { customTransformExample } from './custom-transform';
import { strokeMiterlimitExample } from './stroke-miterlimit';
import { updateExample } from './update';
import { directUpdateExample } from './direct-update';

export * from './types';

export const showcaseExamples: ShowcaseExample[] = [
  // Basic (alphabetically sorted by title)
  // updateExample,
  customTransformExample,
  directUpdateExample,
  fillRuleExample,
  fillSpreadExample,
  gradientStrokeExample,
  gradientTransformExample,
  gradientsExample,
  imageRotationExample,
  imageScalingExample,
  opacityExample,
  pathExample,
  radialGradientExample,
  // sceneExample,
  sceneBlendingExample,
  sceneTransformExample,
  basicShapesExample,
  strokeLineExample,
  strokeMiterlimitExample,
  strokeExample,
  // transformStaticExample,
  transformAnimationExample,
  trimPathExample,
  // Advanced (alphabetically sorted by title)
  boundingBoxExample,
  clippingExample,
  duplicateExample,
  viewportExample,
  // Text (alphabetically sorted by title)
  textAnimationExample,
  textStaticExample,
  // Media (alphabetically sorted by title)
  pictureJpgExample,
  lottieAnimationExample,
  picturePngExample,
  pictureSvgExample,
  pictureWebpExample
];

export const getExampleById = (id: string): ShowcaseExample | undefined => {
  return showcaseExamples.find(example => example.id === id);
};

export const getExamplesByCategory = (category: ShowcaseExample['category']): ShowcaseExample[] => {
  return showcaseExamples.filter(example => example.category === category);
};
