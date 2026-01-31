'use client';

import { useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
// @ts-ignore
import webcanvasTypes from "../node_modules/@thorvg/webcanvas/dist/webcanvas.d.ts?raw";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ code, onChange, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  function handleEditorWillMount(monaco: Monaco) {
    monacoRef.current = monaco;

    // Configure TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowNonTsExtensions: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      noLib: false,
      skipLibCheck: true,
      lib: [
        'es2020',
        'es2019',
        'es2018',
        'es2017',
        'es2016',
        'es2015',
        'dom',
        'dom.iterable',
        'webworker',
        'scripthost',
      ],
    });

    // Enable more permissive validation for playground
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [
        1375, // 'await' expressions are only allowed at the top level of a file
        1378, // Top-level 'await' expressions are only allowed when...
        2304, // Cannot find name (for global variables like TVG, canvas)
        2339, // Property does not exist (too strict for playground)
        2552, // Cannot find name. Did you mean...
        2792, // Cannot find module '@thorvg/webcanvas'
        6133, // Variable is declared but never used
        7016, // Could not find a declaration file
        80001, // File is a CommonJS module
        80005, // 'require' call may be converted to an import
      ],
    });

    // Add type definitions for @thorvg/webcanvas
    const thorvgTypes = `declare module '@thorvg/webcanvas' {
${webcanvasTypes}
}

// Global declarations for playground context with proper types
declare const TVG: import('@thorvg/webcanvas').ThorVGNamespace;
declare const canvas: import('@thorvg/webcanvas').Canvas;
`;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      thorvgTypes,
      'file:///node_modules/@types/thorvg-webcanvas/index.d.ts'
    );
  }

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor;
  }

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      onChange(value);
    }
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          folding: true,
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </div>
  );
}
