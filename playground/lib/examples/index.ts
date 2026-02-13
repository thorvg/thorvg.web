import { ShowcaseExample } from './types';
import { basicShapesExample } from './basic-shapes';
import { blendingExample } from './blending';
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
import { textLayoutExample } from './text-layout';
import { textLineWrapExample } from './text-line-wrap';
import { pictureSvgExample } from './picture-svg';
import { pictureJpgExample } from './picture-jpg';
import { picturePngExample } from './picture-png';
import { pictureWebpExample } from './picture-webp';
import { pictureRawExample } from './picture-raw';
import { animationExample } from './animation';
import { lottieExample } from './lottie';
import { lottieExpressionsExample } from './lottie-expressions';
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
import { maskingExample } from './masking';
import { lumaMaskingExample } from './luma-masking';
import { maskingMethodsExample } from './masking-methods';
import { gradientMaskingExample } from './gradient-masking';
import { intersectsExample } from './intersects';
import { effectDropShadowExample } from './effect-drop-shadow';
import { sceneEffectsExample } from './scene-effects';
import { errorHandlingExample } from './error-handling';

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
  blendingExample,
  boundingBoxExample,
  clippingExample,
  duplicateExample,
  effectDropShadowExample,
  errorHandlingExample,
  gradientMaskingExample,
  intersectsExample,
  lumaMaskingExample,
  maskingExample,
  maskingMethodsExample,
  sceneEffectsExample,
  viewportExample,
  // Text (alphabetically sorted by title)
  textAnimationExample,
  textLayoutExample,
  textLineWrapExample,
  textStaticExample,
  // Media (alphabetically sorted by title)
  animationExample,
  lottieExample,
  lottieExpressionsExample,
  pictureJpgExample,
  picturePngExample,
  pictureRawExample,
  pictureSvgExample,
  pictureWebpExample
];

export const getExampleById = (id: string): ShowcaseExample | undefined => {
  return showcaseExamples.find(example => example.id === id);
};

export const getExamplesByCategory = (category: ShowcaseExample['category']): ShowcaseExample[] => {
  return showcaseExamples.filter(example => example.category === category);
};
