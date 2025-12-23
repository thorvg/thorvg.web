#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const apiJsonPath = path.join(__dirname, '../docs/api.json');
if (!fs.existsSync(apiJsonPath)) {
  console.error('Error: docs/api.json not found. Run typedoc first.');
  process.exit(1);
}

const apiData = JSON.parse(fs.readFileSync(apiJsonPath, 'utf8'));

// Read README.md
const readmePath = path.join(__dirname, '../README.md');
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
  other: []
};

function processItem(item, parentName = '', parentCategory = null) {
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
  if (parentName && (kindString === 'Property' || kindString === 'Accessor')) {
    return;
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

  // Process signatures if present
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
      const title = category.charAt(0).toUpperCase() + category.slice(1);

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

            // Clear README content when displaying API
            const readmeDiv = document.getElementById('readme-content');
            if (readmeDiv) {
                readmeDiv.innerHTML = '';
            }

            let html = \`<h1>\${escapeHtml(api.name)}</h1>\`;
            html += \`<p class="meta"><strong>Kind:</strong> \${escapeHtml(api.kind)}</p>\`;

            if (api.returnType && api.returnType !== 'any' && api.returnType !== 'void') {
                html += \`<p class="meta"><strong>Returns:</strong> <code>\${escapeHtml(api.returnType)}</code></p>\`;
            } else if (api.type && api.type !== 'any') {
                html += \`<p class="meta"><strong>Type:</strong> <code>\${escapeHtml(api.type)}</code></p>\`;
            }

            if (api.comment) {
                html += \`<div class="description">\${escapeHtml(api.comment)}</div>\`;
            }

            // Show constructor for classes and interfaces
            if (api.constructor && (api.kind === 'Class' || api.kind === 'Interface')) {
                html += '<h2>Constructor</h2>';
                if (api.constructor.comment) {
                    html += \`<div class="description">\${escapeHtml(api.constructor.comment)}</div>\`;
                }
                if (api.constructor.parameters && api.constructor.parameters.length > 0) {
                    html += '<h3>Parameters</h3><ul class="params">';
                    api.constructor.parameters.forEach(param => {
                        const optional = param.optional ? '?' : '';
                        html += \`<li><code>\${escapeHtml(param.name)}\${optional}</code>: <code>\${escapeHtml(param.type)}</code>\`;
                        if (param.comment) html += \` - \${escapeHtml(param.comment)}\`;
                        html += '</li>';
                    });
                    html += '</ul>';
                }
            }

            // Show destroy method for classes and interfaces
            if (api.destroy && (api.kind === 'Class' || api.kind === 'Interface')) {
                html += '<h2>Destroy</h2>';
                if (api.destroy.comment) {
                    html += \`<div class="description">\${escapeHtml(api.destroy.comment)}</div>\`;
                }
                if (api.destroy.parameters && api.destroy.parameters.length > 0) {
                    html += '<h3>Parameters</h3><ul class="params">';
                    api.destroy.parameters.forEach(param => {
                        const optional = param.optional ? '?' : '';
                        html += \`<li><code>\${escapeHtml(param.name)}\${optional}</code>: <code>\${escapeHtml(param.type)}</code>\`;
                        if (param.comment) html += \` - \${escapeHtml(param.comment)}\`;
                        html += '</li>';
                    });
                    html += '</ul>';
                }
                if (api.destroy.returnType && api.destroy.returnType !== 'void') {
                    html += \`<p class="meta"><strong>Returns:</strong> <code>\${escapeHtml(api.destroy.returnType)}</code></p>\`;
                }
            }

            // Show properties for interfaces and types (with full section structure)
            if (api.properties && api.properties.length > 0 && (api.kind === 'Interface' || api.kind === 'Type alias')) {
                api.properties.forEach(prop => {
                    const optional = prop.optional ? '?' : '';
                    html += \`<h2>\${escapeHtml(prop.name)}\${optional}</h2>\`;
                    html += \`<p class="meta"><strong>Type:</strong> <code>\${escapeHtml(prop.type)}</code></p>\`;
                    if (prop.comment) {
                        html += \`<div class="description">\${escapeHtml(prop.comment)}</div>\`;
                    }
                });
            }

            if (api.parameters && api.parameters.length > 0) {
                html += '<h2>Parameters</h2><ul class="params">';
                api.parameters.forEach(param => {
                    const optional = param.optional ? '?' : '';
                    html += \`<li><code>\${escapeHtml(param.name)}\${optional}</code>: <code>\${escapeHtml(param.type)}</code>\`;
                    if (param.comment) html += \` - \${escapeHtml(param.comment)}\`;
                    html += '</li>';
                });
                html += '</ul>';
            }

            if (api.examples && api.examples.length > 0) {
                html += '<h2>Examples</h2>';
                api.examples.forEach(example => {
                    // Remove markdown code fences if present
                    let code = example.replace(/^\`\`\`(?:typescript|ts|javascript|js)?\\n?/gm, '').replace(/\`\`\`$/gm, '').trim();
                    html += \`<pre><code class="language-typescript">\${escapeHtml(code)}</code></pre>\`;
                });
            }

            content.innerHTML = html;

            // Highlight code blocks with Prism
            if (window.Prism) {
                content.querySelectorAll('pre code').forEach(block => {
                    window.Prism.highlightElement(block);
                });
            }
        }

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
  `;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ThorVG Canvas Kit API Documentation</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            height: 100vh;
            overflow: hidden;
            background: #ffffff;
            color: #333;
        }

        .sidebar {
            width: 280px;
            background: #fafafa;
            overflow-y: auto;
            padding: 20px 15px;
            border-right: 1px solid #e0e0e0;
        }

        .sidebar h1 {
            font-size: 16px;
            margin: 0 0 20px 0;
            color: #1976d2;
            font-weight: 600;
        }

        .sidebar input {
            width: 100%;
            padding: 8px 10px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 3px;
            margin-bottom: 20px;
            font-size: 13px;
        }

        .category {
            margin-bottom: 20px;
        }

        .category-title {
            font-size: 12px;
            font-weight: 600;
            color: #1976d2;
            margin-bottom: 8px;
            padding-left: 4px;
        }

        .api-list {
            list-style: none;
        }

        .api-item {
            padding: 5px 8px;
            cursor: pointer;
            font-size: 13px;
            color: #555;
            transition: all 0.15s;
            border-left: 2px solid transparent;
        }

        .api-item:hover {
            background: #f0f0f0;
            color: #1976d2;
        }

        .api-item.active {
            background: #e3f2fd;
            color: #1976d2;
            border-left-color: #1976d2;
            font-weight: 500;
        }

        .api-item.hidden {
            display: none;
        }

        .content {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
        }

        .content h1 {
            color: #1976d2;
            margin-bottom: 1rem;
        }

        .content h2 {
            color: #1976d2;
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }

        .meta {
            color: #666;
            margin: 0.5rem 0;
        }

        .description {
            line-height: 1.6;
            margin: 1rem 0;
        }

        .params {
            list-style: none;
            padding-left: 1rem;
        }

        .params li {
            margin: 0.5rem 0;
        }

        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
            font-family: 'Monaco', 'Menlo', monospace;
        }

        pre {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            margin: 1rem 0;
        }

        pre code {
            background: none;
            padding: 0;
        }
    </style>
</head>
<body>
    <div class="sidebar">
        <h1>ThorVG Canvas Kit</h1>
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

fs.writeFileSync(path.join(__dirname, '../docs/index.html'), html);
console.log('✓ Documentation generated: docs/index.html');
