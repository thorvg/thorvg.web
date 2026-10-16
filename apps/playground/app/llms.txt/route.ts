import { showcaseExamples } from "@/lib/examples";

const SITE_URL = 'https://thorvg-playground.vercel.app';

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
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}