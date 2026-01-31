import { ShowcaseExample } from './types';

export const errorHandlingExample: ShowcaseExample = {
  id: 'error-handling',
  title: 'Error Handling',
  description: 'Global error handler catches',
  category: 'advanced',
  thumbnail: '/assets/error-handling-thumbnail.png',
  code: `// Global error handling catches

import { init, ThorVGError, ThorVGResultCode } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop(),
  onError: (error, context) => {
    console.log(error.message);
    console.log('Error operation:', context.operation);

    // Check error type
    if (error instanceof ThorVGError) {
      // WASM error from native ThorVG
      console.log('Type: ThorVGError (WASM)');
      switch (error.code) {
        case ThorVGResultCode.InvalidArguments:
          console.log('Invalid arguments');
          break;
        case ThorVGResultCode.InsufficientCondition:
          console.log('Insufficient condition');
          break;
        case ThorVGResultCode.FailedAllocation:
          console.log('Failed allocation');
          break;
        case ThorVGResultCode.MemoryCorruption:
          console.log('Memory corruption');
          break;
        case ThorVGResultCode.NotSupported:
          console.log('Not supported');
          break;
        case ThorVGResultCode.Unknown:
          console.log('Unknown error');
          break;
      }
    } else {
      // JavaScript error from WebCanvas
      console.log('Type: Error (JavaScript)');
    }
  }
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600
});

// Background
const background = new TVG.Shape();
background.appendRect(0, 0, 600, 600);
background.fill(45, 45, 45);
canvas.add(background);

// Error: Invalid SVG data (ThorVGError - WASM error)
const picture = new TVG.Picture();
picture.load('invalid svg data', { type: 'svg' }); // Error caught by onError
canvas.add(picture);

// Visual indicator
const errorIndicator = new TVG.Shape();
errorIndicator.appendCircle(300, 300, 100, 100);
errorIndicator.fill(255, 100, 100, 255);
canvas.add(errorIndicator);

// Info text
const infoText = new TVG.Text();
infoText.font('default');
infoText.fontSize(16);
infoText.text('Check console for error logs');
infoText.fill(255, 255, 255);
infoText.translate(150, 500);
canvas.add(infoText);

canvas.render();
`
};
