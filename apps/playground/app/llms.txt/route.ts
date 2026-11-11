import { showcaseExamples } from '@/lib/examples';
import packageJson from '@/package.json';

const SITE_URL = packageJson.homepage.replace(/\/$/, '');

export const dynamic = 'force-static';

export function GET() {
  const examples = showcaseExamples
    .map(
      ({ id, title, description}) =>
        `- [${title}](${SITE_URL}/showcase/${id}): ${description}`
    )
    .join('\n');

  const content = `# ThorVG Playground

> Interactive TypeScript examples for ThorVG WebCanvas with editable code and live previews.

Select a renderer with the query parameter: renderer=sw (Software), renderer=gl (WebGL), or renderer=wg (WebGPU). The default is gl.

## Main pages

- [Home](${SITE_URL}): Browse all examples.

## Examples

${examples}

## Project

- [ThorVG Web repository](https://github.com/thorvg/thorvg.web): Source code and development documentation.
- [Playground source](https://github.com/thorvg/thorvg.web/tree/main/apps/playground): Source code for this application.
- [ThorVG website](https://www.thorvg.org/): ThorVG project documentation and resources.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}