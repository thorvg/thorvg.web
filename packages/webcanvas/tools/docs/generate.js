#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Application, ReflectionKind } = require('typedoc');

const packageRoot = path.join(__dirname, '../..');
const docsDir = path.join(packageRoot, 'docs');

// Serialize JSON for embedding inside an inline <script>. JSON.stringify does not
// escape '/', so a literal "</script>" in the data (e.g. README code samples) would
// terminate the script tag early. Escaping '<'/'>' keeps the HTML parser from
// breaking out while remaining valid JS that parses back to the original string.
function safeJson(obj, space) {
  return JSON.stringify(obj, null, space)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function getKindString(reflection) {
  const raw = ReflectionKind[reflection.kind];
  if (!raw || typeof raw !== 'string') return 'Unknown';
  return raw.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function getTypeString(type) {
  if (!type) return 'any';
  return type.toString();
}

function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function commentPartsText(parts) {
  if (!parts || parts.length === 0) return '';
  return parts.map(part => {
    switch (part.kind) {
      case 'text':
      case 'code':
        return part.text || '';
      case 'inline-tag': {
        const label = (part.text || '').trim();
        const tag = (part.tag || '').replace(/^@/, '');
        if (tag === 'link' || tag === 'linkcode' || tag === 'linkplain') {
          if (!label) return '';
          const pipe = label.indexOf('|');
          if (pipe !== -1) {
            const href = label.slice(0, pipe).trim();
            const text = label.slice(pipe + 1).trim() || href;
            return `[${text}](#${slugify(href)})`;
          }
          const space = label.search(/\s/);
          if (space !== -1) {
            const href = label.slice(0, space).trim();
            const text = label.slice(space + 1).trim() || href;
            return `[${text}](#${slugify(href)})`;
          }
          return `[${label}](#${slugify(label)})`;
        }
        return label;
      }
      default:
        return part.text || '';
    }
  }).join('');
}

function getCommentText(comment) {
  if (!comment) return '';
  return commentPartsText(comment.summary);
}

function commentHasModifier(comment, tag) {
  return !!comment?.hasModifier?.(tag);
}

function hasBetaTag(reflection) {
  if (commentHasModifier(reflection.comment, '@beta')) return true;
  if (reflection.signatures?.some(sig => commentHasModifier(sig.comment, '@beta'))) return true;
  if (commentHasModifier(reflection.getSignature?.comment, '@beta')) return true;
  if (commentHasModifier(reflection.setSignature?.comment, '@beta')) return true;
  return false;
}

function getExamples(comment) {
  if (!comment?.getTags) return [];
  return comment.getTags('@example').map(tag => commentPartsText(tag.content));
}

function getReturnsText(comment) {
  if (!comment?.getTag) return '';
  const tag = comment.getTag('@returns') || comment.getTag('@return');
  if (!tag) return '';
  return commentPartsText(tag.content).trim();
}

// Map a raw @category tag (lowercased) to an internal category key.
// Order matters: 'lottie' must precede 'animation' since 'lottieanimation'
// contains 'animation' as a substring.
function matchCategory(category) {
  if (category.includes('initialization')) return 'initialization';
  if (category.includes('canvas')) return 'canvas';
  if (category.includes('lottie')) return 'lottieAnimation';
  if (category.includes('paint')) return 'paint';
  if (category.includes('shape')) return 'shapes';
  if (category.includes('scene')) return 'scene';
  if (category.includes('picture')) return 'picture';
  if (category.includes('text')) return 'text';
  if (category.includes('accessor')) return 'accessor';
  if (category.includes('animation')) return 'animation';
  if (category.includes('gradient')) return 'gradients';
  if (category.includes('font')) return 'font';
  if (category.includes('constant')) return 'constants';
  if (category.includes('error')) return 'errorHandling';
  return 'other';
}

function getCategoryFromComment(comment) {
  if (!comment?.getTag) return 'other';
  const categoryTag = comment.getTag('@category');
  if (!categoryTag) return 'other';
  return matchCategory(commentPartsText(categoryTag.content).trim().toLowerCase());
}

function getCategory(reflection) {
  if (reflection.signatures?.length > 0) {
    for (const sig of reflection.signatures) {
      const matched = getCategoryFromComment(sig.comment);
      if (matched !== 'other') return matched;
    }
  }
  if (reflection.getSignature) {
    const matched = getCategoryFromComment(reflection.getSignature.comment);
    if (matched !== 'other') return matched;
  }
  return getCategoryFromComment(reflection.comment);
}

function mapParameters(parameters) {
  if (!parameters) return [];
  return parameters.map(p => ({
    name: p.name,
    type: getTypeString(p.type),
    comment: getCommentText(p.comment),
    optional: p.flags.isOptional,
    rest: p.flags.isRest,
    defaultValue: p.defaultValue != null ? String(p.defaultValue) : undefined
  }));
}

function mapSignature(sig) {
  return {
    comment: getCommentText(sig.comment),
    examples: getExamples(sig.comment),
    parameters: mapParameters(sig.parameters),
    returnType: getTypeString(sig.type),
    returns: getReturnsText(sig.comment)
  };
}

function pickPrimarySignature(signatures) {
  if (!signatures || signatures.length === 0) return null;
  if (signatures.length === 1) return signatures[0];
  return [...signatures].sort((a, b) => {
    const paramDelta = (b.parameters?.length || 0) - (a.parameters?.length || 0);
    if (paramDelta !== 0) return paramDelta;
    return (b.returns?.length || 0) - (a.returns?.length || 0);
  })[0];
}

function createEmptyApis() {
  return {
    initialization: [],
    canvas: [],
    paint: [],
    shapes: [],
    scene: [],
    picture: [],
    text: [],
    animation: [],
    lottieAnimation: [],
    gradients: [],
    font: [],
    accessor: [],
    constants: [],
    errorHandling: [],
    other: []
  };
}

const SKIP_TOP_LEVEL_NAMES = new Set(['constants', 'ThorVGNamespace', 'default', '<internal>']);

const HOISTED_MEMBER_NAMES = new Set(['constructor', 'destroy']);

const HIDDEN_MEMBER_NAMES = new Set(['ptr', 'dispose', 'isDisposed']);

function shouldSkipReflection(reflection, name) {
  if (SKIP_TOP_LEVEL_NAMES.has(name)) return true;
  if (HIDDEN_MEMBER_NAMES.has(name)) return true;
  if (reflection.flags.isPrivate || reflection.flags.isProtected) return true;
  if (commentHasModifier(reflection.comment, '@internal')) return true;
  if (
    reflection.signatures?.length > 0 &&
    reflection.signatures.every(sig => commentHasModifier(sig.comment, '@internal'))
  ) {
    return true;
  }
  return false;
}

function processItem(apis, reflection, parentName = '', parentCategory = null, parentBeta = false, overrides = null) {
  if (reflection.kind === ReflectionKind.Reference) {
    const target = reflection.tryGetTargetReflectionDeep();
    if (!target) return;
    processItem(apis, target, parentName, parentCategory, parentBeta, {
      name: reflection.name,
      id: reflection.id
    });
    return;
  }

  const name = overrides?.name ?? reflection.name;
  const id = overrides?.id ?? reflection.id;

  if (shouldSkipReflection(reflection, name)) return;
  if (parentName && HOISTED_MEMBER_NAMES.has(name)) return;

  const fullName = parentName ? `${parentName}.${name}` : name;
  const beta = parentBeta || hasBetaTag(reflection);
  const itemCategory = getCategory(reflection);
  const category = itemCategory !== 'other' ? itemCategory : (parentCategory || 'other');
  const kindString = getKindString(reflection);

  if (
    reflection.kind === ReflectionKind.TypeLiteral ||
    reflection.kind === ReflectionKind.TypeParameter
  ) {
    return;
  }

  if (parentName && reflection.kind === ReflectionKind.Property) {
    return;
  }

  const type = getTypeString(reflection.type);
  const comment = getCommentText(reflection.comment);
  const examples = getExamples(reflection.comment);
  const returns = getReturnsText(reflection.comment);

  let primary = null;
  if (reflection.kind === ReflectionKind.Accessor) {
    const getter = reflection.getSignature && !commentHasModifier(reflection.getSignature.comment, '@internal')
      ? mapSignature(reflection.getSignature)
      : null;
    const setter = reflection.setSignature && !commentHasModifier(reflection.setSignature.comment, '@internal')
      ? mapSignature(reflection.setSignature)
      : null;
    primary = setter || getter;
  } else if (reflection.signatures?.length > 0) {
    const publicSigs = reflection.signatures
      .filter(sig => !commentHasModifier(sig.comment, '@internal'))
      .map(mapSignature);
    primary = pickPrimarySignature(publicSigs);
  }

  let constructorInfo = null;
  let destroyInfo = null;
  let propertiesInfo = [];
  const isClassOrInterface =
    reflection.kind === ReflectionKind.Class ||
    reflection.kind === ReflectionKind.Interface;

  if (isClassOrInterface && reflection.children) {
    const constructor = reflection.children.find(child => child.name === 'constructor');
    if (constructor?.signatures?.length > 0 && !constructor.inheritedFrom) {
      const ctorSignatures = constructor.signatures
        .filter(sig => !commentHasModifier(sig.comment, '@internal'))
        .map(mapSignature)
        .filter(sig => sig.comment || sig.parameters.length > 0);
      constructorInfo = pickPrimarySignature(ctorSignatures);
    }

    const destroy = reflection.children.find(child => child.name === 'destroy');
    if (destroy?.signatures?.length > 0 && !commentHasModifier(destroy.comment, '@internal')) {
      const desSig = mapSignature(destroy.signatures[0]);
      if (desSig.comment || desSig.parameters.length > 0) {
        destroyInfo = desSig;
      }
    }

    propertiesInfo = reflection.children
      .filter(child => {
        if (shouldSkipReflection(child, child.name)) return false;
        return (
          child.kind === ReflectionKind.Property ||
          child.kind === ReflectionKind.Accessor
        );
      })
      .map(prop => ({
        name: prop.name,
        type: getTypeString(prop.getSignature?.type ?? prop.type),
        comment: getCommentText(prop.getSignature?.comment ?? prop.comment),
        optional: prop.flags.isOptional
      }));
  }

  apis[category].push({
    id,
    name: fullName,
    shortName: name,
    kind: kindString,
    type,
    comment: comment || (primary ? primary.comment : ''),
    examples: examples.length > 0 ? examples : (primary ? primary.examples : []),
    parameters: primary ? primary.parameters : [],
    returnType: primary ? primary.returnType : type,
    returns: (primary && primary.returns) || returns || '',
    constructor: constructorInfo,
    destroy: destroyInfo,
    properties: propertiesInfo,
    parent: parentName,
    beta
  });

  if (reflection.children) {
    reflection.children.forEach(child => {
      processItem(apis, child, fullName, category, beta);
    });
  }
}

function generateSidebar(apis) {
  return Object.entries(apis)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => {
      let title;
      if (category === 'errorHandling') {
        title = 'Error Handling';
      } else if (category === 'lottieAnimation') {
        title = 'Lottie Animation';
      } else {
        title = category.charAt(0).toUpperCase() + category.slice(1);
      }

      const sortedItems = [...items].sort((a, b) => {
        if (category === 'initialization') {
          if (a.shortName === 'init') return -1;
          if (b.shortName === 'init') return 1;
        }
        return a.name.localeCompare(b.name);
      });

      const itemsHtml = sortedItems
        .map(item => `<li class="api-item" data-id="${item.id}">${item.name}${item.beta ? ' <span class="badge-beta">Beta</span>' : ''}</li>`)
        .join('\n                ');

      return `
        <div class="category">
            <div class="category-title">${title}</div>
            <ul class="api-list">
                ${itemsHtml}
            </ul>
        </div>`;
    }).join('\n        ');
}

function generateDisplayFunction() {
  return `
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function renderMarkdown(text) {
            return typeof marked !== 'undefined'
                ? marked.parse(text)
                : escapeHtml(text).replace(/\\n/g, '<br>');
        }

        function renderInlineMarkdown(text) {
            if (!text) return '';
            if (typeof marked !== 'undefined') {
                if (typeof marked.parseInline === 'function') {
                    return marked.parseInline(text);
                }
                let html = String(marked.parse(text)).trim();
                if (html.startsWith('<p>') && html.endsWith('</p>')) {
                    html = html.slice(3, -4);
                }
                return html;
            }
            return escapeHtml(text);
        }

        function formatParamName(param) {
            const rest = param.rest ? '...' : '';
            const optional = param.optional && !param.defaultValue ? '?' : '';
            return rest + param.name + optional;
        }

        function renderParamsList(params) {
            if (!params || params.length === 0) return '';
            let html = '<h3>Parameters</h3><ul class="params">';
            params.forEach(param => {
                html += \`<li><code>\${escapeHtml(formatParamName(param))}</code>: <code>\${escapeHtml(param.type)}</code>\`;
                if (param.defaultValue) html += \` <span class="meta">(default: <code>\${escapeHtml(param.defaultValue)}</code>)</span>\`;
                if (param.comment) html += \` - \${renderInlineMarkdown(param.comment)}\`;
                html += '</li>';
            });
            return html + '</ul>';
        }

        function renderReturns(sig) {
            if (!sig) return '';
            const type = sig.returnType;
            const desc = sig.returns || '';
            if ((!type || type === 'void' || type === 'any') && !desc) return '';
            let html = '<p class="meta"><strong>Returns:</strong> ';
            if (type && type !== 'void' && type !== 'any') html += \`<code>\${escapeHtml(type)}</code>\`;
            if (desc) html += (type && type !== 'void' && type !== 'any' ? ' — ' : '') + renderInlineMarkdown(desc);
            html += '</p>';
            return html;
        }

        function stripFence(example) {
            return example
                .replace(/^\\\`\\\`\\\`(?:typescript|ts|javascript|js)?\\n?/gm, '')
                .replace(/\\\`\\\`\\\`$/gm, '')
                .trim();
        }

        function renderExamples(examples, withHeading) {
            if (withHeading === undefined) withHeading = true;
            if (!examples || examples.length === 0) return '';
            let html = withHeading ? '<h2>Examples</h2>' : '';
            examples.forEach(example => {
                html += \`<pre><code class="language-typescript">\${escapeHtml(stripFence(example))}</code></pre>\`;
            });
            return html;
        }

        function renderSection(section, title) {
            if (!section) return '';
            const hasComment = !!section.comment;
            const hasParams = section.parameters && section.parameters.length > 0;
            const hasReturns = !!(section.returns || (section.returnType && section.returnType !== 'void' && section.returnType !== 'any'));
            if (!hasComment && !hasParams && !hasReturns) return '';
            let html = \`<h2>\${title}</h2>\`;
            if (hasComment) html += \`<div class="description">\${renderMarkdown(section.comment)}</div>\`;
            html += renderParamsList(section.parameters);
            html += renderReturns(section);
            return html;
        }

        function renderProperties(api) {
            if (!api.properties || api.properties.length === 0) return '';
            if (api.kind !== 'Interface' && api.kind !== 'Type Alias') return '';
            let html = '';
            api.properties.forEach(prop => {
                const optional = prop.optional ? '?' : '';
                html += \`<h2>\${escapeHtml(prop.name)}\${optional}</h2>\`;
                html += \`<p class="meta"><strong>Type:</strong> <code>\${escapeHtml(prop.type)}</code></p>\`;
                if (prop.comment) html += \`<div class="description">\${renderMarkdown(prop.comment)}</div>\`;
            });
            return html;
        }

        function displayAPI(id) {
            let api = null;
            for (const category in apiData) {
                api = apiData[category].find(a => a.id === id);
                if (api) break;
            }

            if (!api) {
                content.innerHTML = '<h1>Not Found</h1>';
                return null;
            }

            const readmeDiv = document.getElementById('readme-content');
            if (readmeDiv) readmeDiv.innerHTML = '';

            const isClassLike = api.kind === 'Class' || api.kind === 'Interface';
            const betaBadge = api.beta ? ' <span class="badge-beta">Beta</span>' : '';
            let html = \`<h1>\${escapeHtml(api.name)}\${betaBadge}</h1>\`;
            html += \`<p class="meta"><strong>Kind:</strong> \${escapeHtml(api.kind)}</p>\`;

            if (api.returnType && api.returnType !== 'any' && api.returnType !== 'void') {
                html += \`<p class="meta"><strong>Returns:</strong> <code>\${escapeHtml(api.returnType)}</code>\`;
                if (api.returns) html += \` — \${renderInlineMarkdown(api.returns)}\`;
                html += '</p>';
            } else if (api.returns) {
                html += \`<p class="meta"><strong>Returns:</strong> \${renderInlineMarkdown(api.returns)}</p>\`;
            } else if (api.type && api.type !== 'any') {
                html += \`<p class="meta"><strong>Type:</strong> <code>\${escapeHtml(api.type)}</code></p>\`;
            }

            if (api.comment) html += \`<div class="description">\${renderMarkdown(api.comment)}</div>\`;
            if (isClassLike) html += renderSection(api.constructor, 'Constructor');
            if (isClassLike) html += renderSection(api.destroy, 'Destroy');
            html += renderProperties(api);
            html += renderParamsList(api.parameters);
            html += renderExamples(api.examples);

            content.innerHTML = html;

            if (window.Prism) {
                content.querySelectorAll('pre code').forEach(block => {
                    window.Prism.highlightElement(block);
                });
            }
            return api;
        }

        function clientSlugify(name) {
            return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }

        function allApis() {
            return Object.values(apiData).flat();
        }

        function findApiByHash(hash) {
            const slug = decodeURIComponent(String(hash || '').replace(/^#/, '')).toLowerCase();
            if (!slug) return null;
            const items = allApis();
            return items.find(a => clientSlugify(a.name) === slug)
                || items.find(a => !a.parent && clientSlugify(a.shortName) === slug)
                || items.find(a => clientSlugify(a.shortName) === slug)
                || null;
        }

        function apiHash(api) {
            return '#' + clientSlugify(api.parent ? api.name : api.shortName);
        }

        let syncingHash = false;
        function selectAPI(id, updateHash) {
            if (updateHash === undefined) updateHash = true;
            apiItems.forEach(i => i.classList.remove('active'));
            const item = document.querySelector('.api-item[data-id="' + id + '"]');
            if (item) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            }
            const api = displayAPI(id);
            if (api && updateHash) {
                const next = apiHash(api);
                if (location.hash !== next) {
                    syncingHash = true;
                    location.hash = next;
                    syncingHash = false;
                }
            }
            return api;
        }

        function applyHash() {
            if (syncingHash) return;
            const api = findApiByHash(location.hash);
            if (api) selectAPI(api.id, false);
        }
  `;
}

const categoryTitles = {
  initialization: 'Initialization',
  canvas: 'Canvas',
  paint: 'Paint',
  shapes: 'Shapes',
  scene: 'Scene',
  picture: 'Picture',
  text: 'Text',
  animation: 'Animation',
  lottieAnimation: 'Lottie Animation',
  gradients: 'Gradients',
  font: 'Font',
  accessor: 'Accessor',
  constants: 'Constants',
  errorHandling: 'Error Handling',
  other: 'Other',
};

function generateLlmsTxt(apis) {
  let out = `# @thorvg/webcanvas\n\n`;
  out += `> A TypeScript WebCanvas API for ThorVG — high-performance vector graphics rendering\n`;
  out += `> via WebGL, WebGPU, and Software backends using WebAssembly.\n`;
  out += `> Install: \`npm install @thorvg/webcanvas\`\n\n`;

  for (const [cat, items] of Object.entries(apis)) {
    const topLevel = items.filter(item => !item.parent);
    if (topLevel.length === 0) continue;
    out += `## ${categoryTitles[cat] || cat}\n\n`;
    for (const item of topLevel) {
      const desc = item.comment ? item.comment.split('\n')[0].trim() : '';
      const anchor = slugify(item.name);
      const betaMark = item.beta ? ' *(beta)*' : '';
      out += `- [${item.name}](./llms-full.txt#${anchor})${betaMark}${desc ? ': ' + desc : ''}\n`;
    }
    out += '\n';
  }

  out += `## Additional Resources\n\n`;
  out += `- [Full API Reference](./llms-full.txt)\n`;
  out += `- [Playground Examples](https://thorvg-playground.vercel.app/)\n`;

  return out;
}

function formatParamName(p) {
  const rest = p.rest ? '...' : '';
  const optional = p.optional && !p.defaultValue ? '?' : '';
  return `${rest}${p.name}${optional}`;
}

function renderParams(params) {
  if (!params || params.length === 0) return '';
  let out = '\n**Parameters:**\n';
  for (const p of params) {
    const def = p.defaultValue ? ` (default: \`${p.defaultValue}\`)` : '';
    out += `- \`${formatParamName(p)}\` \`${p.type}\`${def}${p.comment ? ' — ' + p.comment : ''}\n`;
  }
  return out;
}

function renderReturnsLlms(item) {
  const type = item.returnType;
  const desc = item.returns || '';
  if ((!type || type === 'void' || type === 'any') && !desc) return '';
  let out = '\n**Returns:**';
  if (type && type !== 'void' && type !== 'any') out += ` \`${type}\``;
  if (desc) out += `${type && type !== 'void' && type !== 'any' ? ' — ' : ' '}${desc}`;
  return out + '\n';
}

function renderExamples(examples) {
  if (!examples || examples.length === 0) return '';
  let out = '\n**Example:**\n';
  for (const ex of examples) {
    const code = ex.replace(/^```(?:typescript|ts|javascript|js)?\n?/gm, '').replace(/```$/gm, '').trim();
    out += `\`\`\`typescript\n${code}\n\`\`\`\n`;
  }
  return out;
}

function renderLlmsHeader() {
  return [
    `# @thorvg/webcanvas — Full API Reference\n`,
    `> Install: \`npm install @thorvg/webcanvas\`\n`,
    `## Quick Start\n`,
    '```typescript',
    `import ThorVG from '@thorvg/webcanvas';`,
    `import wasmUrl from '@thorvg/webcanvas/dist/thorvg.wasm?url'; // Vite/webpack`,
    ``,
    `const TVG = await ThorVG.init({ renderer: 'gl', locateFile: () => wasmUrl });`,
    `const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });`,
    ``,
    `const shape = new TVG.Shape();`,
    `shape.appendRect(100, 100, 200, 150).fill(255, 0, 0, 255);`,
    'canvas.add(shape).render();\n```\n',
    `---\n`,
  ].join('\n');
}

function renderLlmsProperties(properties) {
  if (!properties || properties.length === 0) return '';
  let out = `**Properties:**\n`;
  for (const prop of properties) {
    const opt = prop.optional ? '?' : '';
    out += `- \`${prop.name}${opt}\` \`${prop.type}\`${prop.comment ? ' — ' + prop.comment : ''}\n`;
  }
  return out + '\n';
}

function renderLlmsMethod(parentName, method) {
  let out = `\n#### ${parentName}.${method.shortName}${method.beta ? ' *(beta)*' : ''}\n\n`;
  if (method.comment) out += `${method.comment}\n`;
  out += renderParams(method.parameters);
  out += renderReturnsLlms(method);
  out += renderExamples(method.examples);
  return out;
}

function renderLlmsItem(item, children) {
  let out = `### ${item.name}${item.beta ? ' *(beta)*' : ''}\n\n**Kind:** ${item.kind}\n\n`;
  if (item.comment) out += `${item.comment}\n\n`;
  if (item.constructor) {
    out += `**Constructor:**\n`;
    if (item.constructor.comment) out += `${item.constructor.comment}\n`;
    out += renderParams(item.constructor.parameters) + '\n';
  }
  out += renderLlmsProperties(item.properties);
  out += renderExamples(item.examples);
  for (const method of children.filter(c => c.parent === item.name)) {
    out += renderLlmsMethod(item.name, method);
  }
  return out + '\n---\n\n';
}

function generateLlmsFullTxt(apis) {
  let out = renderLlmsHeader();
  for (const [cat, items] of Object.entries(apis)) {
    if (items.length === 0) continue;
    out += `## ${categoryTitles[cat] || cat}\n\n`;
    const children = items.filter(item => item.parent);
    for (const item of items.filter(item => !item.parent)) {
      out += renderLlmsItem(item, children);
    }
  }
  return out;
}

async function loadProject() {
  let options = {
    entryPoints: [path.join(packageRoot, 'src/index.ts')],
    tsconfig: path.join(packageRoot, 'tsconfig.json'),
    excludePrivate: true,
    excludeInternal: true,
    excludeProtected: false,
    plugin: ['typedoc-plugin-missing-exports'],
  };

  const typedocJsonPath = path.join(packageRoot, 'typedoc.json');
  try {
    const typedocJson = JSON.parse(fs.readFileSync(typedocJsonPath, 'utf8'));
    const {
      $schema: _schema,
      out: _out,
      json: _json,
      readme: _readme,
      githubPages: _githubPages,
      hideGenerator: _hideGenerator,
      categorizeByGroup: _categorizeByGroup,
      defaultCategory: _defaultCategory,
      categoryOrder: _categoryOrder,
      navigation: _navigation,
      searchInComments: _searchInComments,
      searchInDocuments: _searchInDocuments,
      sort: _sort,
      kindSortOrder: _kindSortOrder,
      visibilityFilters: _visibilityFilters,
      lightHighlightTheme: _lightHighlightTheme,
      darkHighlightTheme: _darkHighlightTheme,
      titleLink: _titleLink,
      includeVersion: _includeVersion,
      name: _name,
      ...rest
    } = typedocJson;
    options = {
      ...options,
      ...rest,
      entryPoints: (rest.entryPoints || options.entryPoints).map(ep =>
        path.isAbsolute(ep) ? ep : path.join(packageRoot, ep)
      ),
      tsconfig: rest.tsconfig
        ? (path.isAbsolute(rest.tsconfig) ? rest.tsconfig : path.join(packageRoot, rest.tsconfig))
        : options.tsconfig,
    };
  } catch (err) {
    console.warn(`Warning: could not read typedoc.json (${err.message}); using defaults.`);
  }

  const app = await Application.bootstrapWithPlugins(options);
  const project = await app.convert();
  if (!project) {
    throw new Error('TypeDoc convert() failed');
  }
  return project;
}

async function main() {
  const readmePath = path.join(packageRoot, 'README.md');
  const readmeContent = (fs.existsSync(readmePath)
  ? fs.readFileSync(readmePath, 'utf8')
  : '').replace(/<p align="center">\s*<img[^>]*>\s*<\/p>\s*/g, '');

  const project = await loadProject();
  const apis = createEmptyApis();

  if (project.children) {
    project.children.forEach(item => processItem(apis, item));
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ThorVG WebCanvas API Documentation</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="sidebar">
        <h1>ThorVG WebCanvas</h1>
        <input type="text" id="search" placeholder="Search APIs...">
        ${generateSidebar(apis)}
    </div>

    <div class="content" id="content">
        <div id="readme-content"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script>
        const apiData = ${safeJson(apis, 2)};
        const readmeMarkdown = ${safeJson(readmeContent)};
        const searchInput = document.getElementById('search');
        const apiItems = document.querySelectorAll('.api-item');
        const content = document.getElementById('content');

        const readmeDiv = document.getElementById('readme-content');
        if (readmeDiv && readmeMarkdown && typeof marked !== 'undefined') {
            readmeDiv.innerHTML = marked.parse(readmeMarkdown);
            if (window.Prism) {
                readmeDiv.querySelectorAll('pre code').forEach(block => {
                    window.Prism.highlightElement(block);
                });
            }
        }

        ${generateDisplayFunction()}

        apiItems.forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.getAttribute('data-id'));
                selectAPI(id);
            });
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            apiItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.classList.toggle('hidden', !text.includes(searchTerm));
            });
        });

        window.addEventListener('hashchange', applyHash);
        if (location.hash) {
            applyHash();
        }
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
</body>
</html>
`;

  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, 'index.html'), html);
  fs.copyFileSync(path.join(__dirname, 'style.css'), path.join(docsDir, 'style.css'));

  const llmsTxt = generateLlmsTxt(apis);
  fs.writeFileSync(path.join(docsDir, 'llms.txt'), llmsTxt);
  fs.copyFileSync(path.join(docsDir, 'llms.txt'), path.join(packageRoot, 'llms.txt'));

  const llmsFullTxt = generateLlmsFullTxt(apis);
  fs.writeFileSync(path.join(docsDir, 'llms-full.txt'), llmsFullTxt);
  fs.copyFileSync(path.join(docsDir, 'llms-full.txt'), path.join(packageRoot, 'llms-full.txt'));

  const items = Object.values(apis).flat();
  const colorStop = items.find(item => item.shortName === 'ColorStop' && !item.parent);
  const font = items.find(item => item.shortName === 'Font' && !item.parent);
  const fontLoad = items.find(item => item.name === 'Font.load');
  const canvasAdd = items.find(item => item.name === 'Canvas.add');
  const setStops = items.find(item => item.name === 'LinearGradient.setStops');
  const canvasCtor = items.find(item => item.shortName === 'Canvas' && !item.parent);

  if (colorStop) console.log(`✓ ColorStop type: ${colorStop.type}`);
  if (font) console.log(`✓ Font {@link}: ${/\[Text\]/.test(font.comment) ? 'ok' : font.comment.slice(0, 80)}`);
  if (fontLoad) {
    console.log(`✓ Font.load params: ${(fontLoad.parameters || []).map(p => p.name).join(', ') || '(none)'}`);
  }
  if (canvasAdd) console.log(`✓ Canvas.add @returns: ${canvasAdd.returns || '(missing)'}`);
  if (setStops) {
    const rest = setStops.parameters?.find(p => p.rest);
    console.log(`✓ setStops rest: ${rest ? '...' + rest.name : '(missing)'}`);
  }
  if (canvasCtor?.constructor?.parameters) {
    const opt = canvasCtor.constructor.parameters.find(p => p.name === 'options');
    console.log(`✓ Canvas ctor default: ${opt?.defaultValue ?? '(missing)'}`);
  }

  console.log('✓ Documentation generated: docs/index.html');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
