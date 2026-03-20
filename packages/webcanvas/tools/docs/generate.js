#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const apiJsonPath = path.join(__dirname, '../../docs/api.json');
if (!fs.existsSync(apiJsonPath)) {
  console.error('Error: docs/api.json not found. Run typedoc first.');
  process.exit(1);
}

const apiData = JSON.parse(fs.readFileSync(apiJsonPath, 'utf8'));

// Read README.md
const readmePath = path.join(__dirname, '../../README.md');
const readmeContent = fs.existsSync(readmePath)
  ? fs.readFileSync(readmePath, 'utf8')
  : '';

// Map TypeDoc kind numbers to readable strings
const kindMap = {
  1: 'Project',
  2: 'Module',
  4: 'Enum',
  8: 'Enum Member',
  16: 'Variable',
  32: 'Function',
  64: 'Class',
  128: 'Interface',
  256: 'Interface',
  512: 'Constructor',
  1024: 'Property',
  2048: 'Method',
  4096: 'Call Signature',
  8192: 'Index Signature',
  16384: 'Constructor Signature',
  32768: 'Parameter',
  65536: 'Type Literal',
  131072: 'Type Parameter',
  262144: 'Accessor',
  524288: 'Get Signature',
  1048576: 'Set Signature',
  2097152: 'Object Literal',
  4194304: 'Type Alias',
  8388608: 'Reference'
};

function getKindString(item) {
  if (item.kindString) return item.kindString;
  return kindMap[item.kind] || 'Unknown';
}

// Helper to get type string
function getTypeString(type) {
  if (!type) return 'any';
  if (type.type === 'intrinsic') return type.name;
  if (type.type === 'reference') return type.name;
  if (type.type === 'array') return getTypeString(type.elementType) + '[]';
  if (type.type === 'literal') return typeof type.value === 'string' ? `'${type.value}'` : String(type.value);
  if (type.type === 'union') return type.types.map(t => getTypeString(t)).join(' | ');
  if (type.type === 'reflection' && type.declaration) {
    if (type.declaration.signatures) {
      const sig = type.declaration.signatures[0];
      const params = sig.parameters ? sig.parameters.map(p =>
        `${p.name}: ${getTypeString(p.type)}`
      ).join(', ') : '';
      return `(${params}) => ${getTypeString(sig.type)}`;
    }
  }
  return type.name || 'unknown';
}

// Helper to get comment text
function getCommentText(comment) {
  if (!comment) return '';

  let text = '';
  if (comment.summary) {
    text = comment.summary.map(s => s.text || '').join('');
  }

  return text;
}

// Helper to get examples
function getExamples(comment) {
  if (!comment || !comment.blockTags) return [];

  return comment.blockTags
    .filter(tag => tag.tag === '@example')
    .map(tag => tag.content.map(c => c.text || '').join(''));
}

// Helper to get category
function getCategory(comment, item) {
  // For functions, check signatures first
  if (item && item.signatures && item.signatures.length > 0) {
    const sigComment = item.signatures[0].comment;
    if (sigComment && sigComment.blockTags) {
      const categoryTag = sigComment.blockTags.find(tag => tag.tag === '@category');
      if (categoryTag) {
        const category = categoryTag.content.map(c => c.text || '').join('').trim().toLowerCase();
        if (category.includes('initialization')) return 'initialization';
        if (category.includes('canvas')) return 'canvas';
        if (category.includes('shape')) return 'shapes';
        if (category.includes('scene')) return 'scene';
        if (category.includes('picture')) return 'picture';
        if (category.includes('text')) return 'text';
        if (category.includes('animation')) return 'animation';
        if (category.includes('gradient')) return 'gradients';
        if (category.includes('font')) return 'font';
        if (category.includes('constant')) return 'constants';
        if (category.includes('error')) return 'errorHandling';
      }
    }
  }

  if (!comment || !comment.blockTags) return 'other';

  const categoryTag = comment.blockTags.find(tag => tag.tag === '@category');
  if (!categoryTag) return 'other';

  const category = categoryTag.content.map(c => c.text || '').join('').trim().toLowerCase();

  if (category.includes('initialization')) return 'initialization';
  if (category.includes('canvas')) return 'canvas';
  if (category.includes('shape')) return 'shapes';
  if (category.includes('scene')) return 'scene';
  if (category.includes('picture')) return 'picture';
  if (category.includes('text')) return 'text';
  if (category.includes('animation')) return 'animation';
  if (category.includes('gradient')) return 'gradients';
  if (category.includes('font')) return 'font';
  if (category.includes('constant')) return 'constants';
  if (category.includes('error')) return 'errorHandling';

  return 'other';
}

// Build API index
const apis = {
  initialization: [],
  canvas: [],
  shapes: [],
  scene: [],
  picture: [],
  text: [],
  animation: [],
  gradients: [],
  font: [],
  constants: [],
  errorHandling: [],
  other: []
};

// Helper to find item by ID in the entire API data tree
function findItemById(data, targetId) {
  if (data.id === targetId) return data;
  if (data.children) {
    for (const child of data.children) {
      const found = findItemById(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

function processItem(item, parentName = '', parentCategory = null) {
  // Handle references - follow the target to get actual definition
  if (item.variant === 'reference' && item.target) {
    const targetItem = findItemById(apiData, item.target);
    if (targetItem) {
      // Use target's comment and properties, but keep the reference's name
      item = {
        ...targetItem,
        name: item.name,
        id: item.id // Keep original ID for linking
      };
    }
  }

  // Skip internal items
  if (item.name === '<internal>' || item.flags?.isPrivate || item.name.startsWith('_')) {
    return;
  }

  // Skip infrastructure items that users don't need to see
  if (item.name === 'constants' || item.name === 'ThorVGNamespace' || item.name === 'default') {
    return;
  }

  const fullName = parentName ? `${parentName}.${item.name}` : item.name;
  const itemCategory = getCategory(item.comment, item);
  // Use parent's category if this item doesn't have one explicitly set
  const category = itemCategory !== 'other' ? itemCategory : (parentCategory || 'other');
  const kindString = getKindString(item);

  // Skip if not a relevant kind
  if (kindString === 'Type Literal' || kindString === 'Type Parameter') {
    return;
  }

  // Skip internal properties, constructors, destroy, and memory management methods
  if (item.name === 'ptr' || item.name === 'constructor' || item.name === 'destroy' ||
      item.name === 'dispose' || item.name === 'isDisposed') {
    return;
  }

  // Skip interface/type properties (they'll be shown in the parent interface documentation)
  // But allow class accessors (getters/setters) to be shown
  if (parentName && (kindString === 'Property' || kindString === 'Accessor')) {
    // Allow Accessors for Classes (like Canvas.dpr, Canvas.renderer)
    // Skip Properties and Accessors only for Interfaces and Types
    if (kindString === 'Accessor') {
      // Allow all accessors - they're public getters/setters
    } else {
      // Skip properties (they're shown in parent interface documentation)
      return;
    }
  }

  const type = getTypeString(item.type);
  const comment = getCommentText(item.comment);
  const examples = getExamples(item.comment);

  // Simplify parameters for embedding
  const parameters = item.parameters ? item.parameters.map(p => ({
    name: p.name,
    type: getTypeString(p.type),
    comment: getCommentText(p.comment),
    optional: p.flags?.isOptional || false
  })) : [];

  // Process signatures if present (methods, functions)
  let signatureInfo = null;
  if (item.signatures && item.signatures.length > 0) {
    const sig = item.signatures[0];
    signatureInfo = {
      comment: getCommentText(sig.comment),
      examples: getExamples(sig.comment),
      parameters: sig.parameters ? sig.parameters.map(p => ({
        name: p.name,
        type: getTypeString(p.type),
        comment: getCommentText(p.comment),
        optional: p.flags?.isOptional || false
      })) : [],
      returnType: getTypeString(sig.type)
    };
  }

  // Process getSignature for accessors (getters)
  if (item.getSignature && !signatureInfo) {
    const sig = item.getSignature;
    signatureInfo = {
      comment: getCommentText(sig.comment),
      examples: getExamples(sig.comment),
      parameters: [],
      returnType: getTypeString(sig.type)
    };
  }

  // Check if this is a class/interface and extract constructor and destroy info
  let constructorInfo = null;
  let destroyInfo = null;
  let propertiesInfo = [];
  if ((item.kind === 64 || item.kind === 128 || item.kind === 256) && item.children) {
    const constructor = item.children.find(child => child.name === 'constructor');
    if (constructor && constructor.signatures && constructor.signatures.length > 0) {
      const conSig = constructor.signatures[0];
      constructorInfo = {
        comment: getCommentText(conSig.comment),
        parameters: conSig.parameters ? conSig.parameters.map(p => ({
          name: p.name,
          type: getTypeString(p.type),
          comment: getCommentText(p.comment),
          optional: p.flags?.isOptional || false
        })) : []
      };
    }

    const destroy = item.children.find(child => child.name === 'destroy');
    if (destroy && destroy.signatures && destroy.signatures.length > 0) {
      const desSig = destroy.signatures[0];
      destroyInfo = {
        comment: getCommentText(desSig.comment),
        parameters: desSig.parameters ? desSig.parameters.map(p => ({
          name: p.name,
          type: getTypeString(p.type),
          comment: getCommentText(p.comment),
          optional: p.flags?.isOptional || false
        })) : [],
        returnType: getTypeString(desSig.type)
      };
    }

    // Extract properties for interfaces/types
    propertiesInfo = item.children
      .filter(child => {
        const childKind = getKindString(child);
        return childKind === 'Property' || childKind === 'Accessor';
      })
      .map(prop => ({
        name: prop.name,
        type: getTypeString(prop.type),
        comment: getCommentText(prop.comment),
        optional: prop.flags?.isOptional || false
      }));
  }

  const apiItem = {
    id: item.id,
    name: fullName,
    shortName: item.name,
    kind: kindString,
    type: type,
    comment: comment || (signatureInfo ? signatureInfo.comment : ''),
    examples: examples.length > 0 ? examples : (signatureInfo ? signatureInfo.examples : []),
    parameters: parameters.length > 0 ? parameters : (signatureInfo ? signatureInfo.parameters : []),
    returnType: signatureInfo ? signatureInfo.returnType : type,
    constructor: constructorInfo,
    destroy: destroyInfo,
    properties: propertiesInfo,
    parent: parentName
  };

  apis[category].push(apiItem);

  // Process children (methods, properties, etc.)
  if (item.children) {
    item.children.forEach(child => {
      processItem(child, fullName, category);
    });
  }
}

// Process all top-level items
if (apiData.children) {
  apiData.children.forEach(item => processItem(item));
}

// Generate sidebar HTML
function generateSidebar() {
  return Object.entries(apis)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => {
      let title;
      if (category === 'errorHandling') {
        title = 'Error Handling';
      } else {
        title = category.charAt(0).toUpperCase() + category.slice(1);
      }

      // Sort items: for initialization, put 'init' first, then alphabetically
      const sortedItems = [...items].sort((a, b) => {
        if (category === 'initialization') {
          if (a.shortName === 'init') return -1;
          if (b.shortName === 'init') return 1;
        }
        return a.name.localeCompare(b.name);
      });

      const itemsHtml = sortedItems
        .map(item => `<li class="api-item" data-id="${item.id}">${item.name}</li>`)
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

// Generate content display function
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

        function renderParamsList(params) {
            if (!params || params.length === 0) return '';
            let html = '<h3>Parameters</h3><ul class="params">';
            params.forEach(param => {
                const optional = param.optional ? '?' : '';
                html += \`<li><code>\${escapeHtml(param.name)}\${optional}</code>: <code>\${escapeHtml(param.type)}</code>\`;
                if (param.comment) html += \` - \${escapeHtml(param.comment)}\`;
                html += '</li>';
            });
            return html + '</ul>';
        }

        function renderSection(section, title) {
            if (!section) return '';
            let html = \`<h2>\${title}</h2>\`;
            if (section.comment) html += \`<div class="description">\${renderMarkdown(section.comment)}</div>\`;
            html += renderParamsList(section.parameters);
            if (section.returnType && section.returnType !== 'void') {
                html += \`<p class="meta"><strong>Returns:</strong> <code>\${escapeHtml(section.returnType)}</code></p>\`;
            }
            return html;
        }

        function renderProperties(api) {
            if (!api.properties || api.properties.length === 0) return '';
            if (api.kind !== 'Interface' && api.kind !== 'Type alias') return '';
            let html = '';
            api.properties.forEach(prop => {
                const optional = prop.optional ? '?' : '';
                html += \`<h2>\${escapeHtml(prop.name)}\${optional}</h2>\`;
                html += \`<p class="meta"><strong>Type:</strong> <code>\${escapeHtml(prop.type)}</code></p>\`;
                if (prop.comment) html += \`<div class="description">\${renderMarkdown(prop.comment)}</div>\`;
            });
            return html;
        }

        function renderExamples(examples) {
            if (!examples || examples.length === 0) return '';
            let html = '<h2>Examples</h2>';
            examples.forEach(example => {
                let code = example.replace(/^\`\`\`(?:typescript|ts|javascript|js)?\\n?/gm, '').replace(/\`\`\`$/gm, '').trim();
                html += \`<pre><code class="language-typescript">\${escapeHtml(code)}</code></pre>\`;
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
                return;
            }

            const readmeDiv = document.getElementById('readme-content');
            if (readmeDiv) readmeDiv.innerHTML = '';

            const isClassLike = api.kind === 'Class' || api.kind === 'Interface';
            let html = \`<h1>\${escapeHtml(api.name)}</h1>\`;
            html += \`<p class="meta"><strong>Kind:</strong> \${escapeHtml(api.kind)}</p>\`;

            if (api.returnType && api.returnType !== 'any' && api.returnType !== 'void') {
                html += \`<p class="meta"><strong>Returns:</strong> <code>\${escapeHtml(api.returnType)}</code></p>\`;
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
        }
  `;
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
        ${generateSidebar()}
    </div>

    <div class="content" id="content">
        <div id="readme-content"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script>
        const apiData = ${JSON.stringify(apis, null, 2)};
        const readmeMarkdown = ${JSON.stringify(readmeContent)};
        const searchInput = document.getElementById('search');
        const apiItems = document.querySelectorAll('.api-item');
        const content = document.getElementById('content');

        // Display README on initial load
        const readmeDiv = document.getElementById('readme-content');
        if (readmeDiv && readmeMarkdown && typeof marked !== 'undefined') {
            readmeDiv.innerHTML = marked.parse(readmeMarkdown);
            // Highlight code blocks in README
            if (window.Prism) {
                readmeDiv.querySelectorAll('pre code').forEach(block => {
                    window.Prism.highlightElement(block);
                });
            }
        }

        ${generateDisplayFunction()}

        apiItems.forEach(item => {
            item.addEventListener('click', () => {
                apiItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                const id = parseInt(item.getAttribute('data-id'));
                displayAPI(id);
            });
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            apiItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.classList.toggle('hidden', !text.includes(searchTerm));
            });
        });
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../../docs/index.html'), html);
fs.copyFileSync(path.join(__dirname, 'style.css'), path.join(__dirname, '../../docs/style.css'));

// llms.txt
const categoryTitles = {
  initialization: 'Initialization',
  canvas: 'Canvas',
  shapes: 'Shapes',
  scene: 'Scene',
  picture: 'Picture',
  text: 'Text',
  animation: 'Animation',
  gradients: 'Gradients',
  font: 'Font',
  constants: 'Constants',
  errorHandling: 'Error Handling',
  other: 'Other',
};

function generateLlmsTxt() {
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
      const anchor = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      out += `- [${item.name}](./llms-full.txt#${anchor})${desc ? ': ' + desc : ''}\n`;
    }
    out += '\n';
  }

  out += `## Additional Resources\n\n`;
  out += `- [Full API Reference](./llms-full.txt)\n`;
  out += `- [Playground Examples](https://thorvg-playground.vercel.app/)\n`;

  return out;
}

fs.writeFileSync(path.join(__dirname, '../../docs/llms.txt'), generateLlmsTxt());
fs.copyFileSync(path.join(__dirname, '../../docs/llms.txt'), path.join(__dirname, '../../llms.txt'));

// llms-full.txt
function renderParams(params) {
  if (!params || params.length === 0) return '';
  let out = '\n**Parameters:**\n';
  for (const p of params) {
    const opt = p.optional ? '?' : '';
    out += `- \`${p.name}${opt}\` \`${p.type}\`${p.comment ? ' — ' + p.comment : ''}\n`;
  }
  return out;
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

function generateLlmsFullTxt() {
  let out = `# @thorvg/webcanvas — Full API Reference\n\n`;
  out += `> Install: \`npm install @thorvg/webcanvas\`\n\n`;
  out += `## Quick Start\n\n`;
  out += `\`\`\`typescript\nimport ThorVG from '@thorvg/webcanvas';\n`;
  out += `import wasmUrl from '@thorvg/webcanvas/dist/thorvg.wasm?url'; // Vite/webpack\n\n`;
  out += `const TVG = await ThorVG.init({ renderer: 'gl', locateFile: () => wasmUrl });\n`;
  out += `const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });\n\n`;
  out += `const shape = new TVG.Shape();\n`;
  out += `shape.appendRect(100, 100, 200, 150).fill(255, 0, 0, 255);\n`;
  out += `canvas.add(shape).render();\n\`\`\`\n\n`;
  out += `---\n\n`;

  for (const [cat, items] of Object.entries(apis)) {
    if (items.length === 0) continue;
    out += `## ${categoryTitles[cat] || cat}\n\n`;

    // Top-level items first
    const topLevel = items.filter(item => !item.parent);
    const children = items.filter(item => item.parent);

    for (const item of topLevel) {
      out += `### ${item.name}\n\n`;
      out += `**Kind:** ${item.kind}\n\n`;
      if (item.comment) out += `${item.comment}\n\n`;

      // Constructor
      if (item.constructor) {
        out += `**Constructor:**\n`;
        if (item.constructor.comment) out += `${item.constructor.comment}\n`;
        out += renderParams(item.constructor.parameters);
        out += '\n';
      }

      // Properties (interfaces/types)
      if (item.properties && item.properties.length > 0) {
        out += `**Properties:**\n`;
        for (const prop of item.properties) {
          const opt = prop.optional ? '?' : '';
          out += `- \`${prop.name}${opt}\` \`${prop.type}\`${prop.comment ? ' — ' + prop.comment : ''}\n`;
        }
        out += '\n';
      }

      out += renderExamples(item.examples);

      // Methods belonging to this class
      const methods = children.filter(c => c.parent === item.name);
      for (const method of methods) {
        out += `\n#### ${item.name}.${method.shortName}\n\n`;
        if (method.returnType && method.returnType !== 'void' && method.returnType !== 'any') {
          out += `**Returns:** \`${method.returnType}\`\n\n`;
        }
        if (method.comment) out += `${method.comment}\n\n`;
        out += renderParams(method.parameters);
        out += renderExamples(method.examples);
      }

      out += '\n---\n\n';
    }
  }

  return out;
}

// Place at the root
fs.writeFileSync(path.join(__dirname, '../../docs/llms-full.txt'), generateLlmsFullTxt());
fs.copyFileSync(path.join(__dirname, '../../docs/llms-full.txt'), path.join(__dirname, '../../llms-full.txt'));

console.log('✓ Documentation generated: docs/index.html');
