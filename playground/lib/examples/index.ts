import { ShowcaseExample } from './types';
import { basicShapesExample } from './basic-shapes';
import { gradientsExample } from './gradients';
import { radialGradientExample } from './radial-gradient';
import { gradientStrokeExample } from './gradient-stroke';
import { strokeExample } from './stroke';
import { pathExample } from './path';
import { fillRuleExample } from './fill-rule';
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
import { lottieAnimationExample } from './lottie-animation';

export * from './types';

export const showcaseExamples: ShowcaseExample[] = [
  basicShapesExample,
  strokeExample,
  pathExample,
  fillRuleExample,
  gradientsExample,
  radialGradientExample,
  gradientStrokeExample,
  opacityExample,
  sceneExample,
  sceneTransformExample,
  clippingExample,
  duplicateExample,
  boundingBoxExample,
  transformStaticExample,
  transformAnimationExample,
  textStaticExample,
  textAnimationExample,
  pictureSvgExample,
  lottieAnimationExample,
];

export const getExampleById = (id: string): ShowcaseExample | undefined => {
  return showcaseExamples.find(example => example.id === id);
};

export const getExamplesByCategory = (category: ShowcaseExample['category']): ShowcaseExample[] => {
  return showcaseExamples.filter(example => example.category === category);
};
