import { ShowcaseExample } from './types';
import { accessorExample } from './accessor';
import { animationExample } from './animation';
import { blendingExample } from './blending';
import { boundingBoxExample } from './bounding-box';
import { clippingExample } from './clipping';
import { conicGradientExample } from './conic-gradient';
import { customTransformExample } from './custom-transform';
import { dataLoadExample } from './data-load';
import { directUpdateExample } from './direct-update';
import { duplicateExample } from './duplicate';
import { effectDropShadowExample } from './effect-drop-shadow';
import { errorHandlingExample } from './error-handling';
import { fillRuleExample } from './fill-rule';
import { fillSpreadExample } from './fill-spread';
import { fontProviderExample } from './font-provider';
import { gradientMaskingExample } from './gradient-masking';
import { gradientStrokeExample } from './gradient-stroke';
import { gradientTransformExample } from './gradient-transform';
import { intersectsExample } from './intersects';
import { linearGradientExample } from './linear-gradient';
import { lottieExample } from './lottie';
import { lottieAssetResolverExample } from './lottie-asset-resolver';
import { lottieAudioExample } from './lottie-audio';
import { lottieExpressionsExample } from './lottie-expressions';
import { lottieInteractionExample } from './lottie-interaction';
import { lottieSlotExample } from './lottie-slot';
import { maskingExample } from './masking';
import { maskingMethodsExample } from './masking-methods';
import { motionBlurExample } from './motion-blur';
import { opacityExample } from './opacity';
import { pathExample } from './path';
import { pictureExample } from './picture';
import { pictureDataExample } from './picture-data';
import { pictureJpgExample } from './picture-jpg';
import { picturePngExample } from './picture-png';
import { pictureRawExample } from './picture-raw';
import { pictureSvgExample } from './picture-svg';
import { pictureTransformExample } from './picture-transform';
import { pictureWebpExample } from './picture-webp';
import { radialGradientExample } from './radial-gradient';
import { retainingExample } from './retaining';
import { sceneExample } from './scene';
import { sceneBlendingExample } from './scene-blending';
import { sceneEffectsExample } from './scene-effects';
import { sceneTransformExample } from './scene-transform';
import { shapesExample } from './shapes';
import { strokeExample } from './stroke';
import { strokeLineExample } from './stroke-line';
import { strokeMiterlimitExample } from './stroke-miterlimit';
import { svgExample } from './svg';
import { textLayoutExample } from './text-layout';
import { textLineWrapExample } from './text-line-wrap';
import { textMetricsExample } from './text-metrics';
import { textOtfExample } from './text-otf';
import { textTtfExample } from './text-ttf';
import { transformExample } from './transform';
import { trimPathExample } from './trim-path';
import { videoExample } from './video';
import { viewportExample } from './viewport';

export * from './types';

export const showcaseExamples: ShowcaseExample[] = [
  // Basic (alphabetically sorted by title)
  conicGradientExample,
  customTransformExample,
  directUpdateExample,
  fillRuleExample,
  fillSpreadExample,
  gradientStrokeExample,
  gradientTransformExample,
  linearGradientExample,
  opacityExample,
  pathExample,
  radialGradientExample,
  retainingExample,
  sceneExample,
  sceneBlendingExample,
  sceneTransformExample,
  shapesExample,
  strokeExample,
  strokeLineExample,
  strokeMiterlimitExample,
  transformExample,
  trimPathExample,
  // Advanced (alphabetically sorted by title)
  accessorExample,
  blendingExample,
  boundingBoxExample,
  clippingExample,
  duplicateExample,
  effectDropShadowExample,
  errorHandlingExample,
  gradientMaskingExample,
  intersectsExample,
  maskingExample,
  maskingMethodsExample,
  motionBlurExample,
  sceneEffectsExample,
  viewportExample,
  // Text (alphabetically sorted by title)
  fontProviderExample,
  textLayoutExample,
  textLineWrapExample,
  textMetricsExample,
  textOtfExample,
  textTtfExample,
  // Media (alphabetically sorted by title)
  animationExample,
  dataLoadExample,
  lottieExample,
  lottieAssetResolverExample,
  lottieAudioExample,
  lottieExpressionsExample,
  lottieInteractionExample,
  lottieSlotExample,
  pictureExample,
  pictureDataExample,
  pictureJpgExample,
  picturePngExample,
  pictureRawExample,
  pictureSvgExample,
  pictureTransformExample,
  pictureWebpExample,
  svgExample,
  videoExample
];

export const getExampleById = (id: string): ShowcaseExample | undefined => {
  return showcaseExamples.find(example => example.id === id);
};

export const getExamplesByCategory = (category: ShowcaseExample['category']): ShowcaseExample[] => {
  return showcaseExamples.filter(example => example.category === category);
};
