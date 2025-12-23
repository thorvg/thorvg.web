'use client';

import { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';

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
        'ES2020',
        'ES2019',
        'ES2018',
        'ES2017',
        'ES2016',
        'ES2015',
        'DOM',
        'DOM.Iterable',
        'WebWorker',
        'ScriptHost',
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
        2792, // Cannot find module '@thorvg/canvas-kit'
        6133, // Variable is declared but never used
        7016, // Could not find a declaration file
        80001, // File is a CommonJS module
        80005, // 'require' call may be converted to an import
      ],
    });

    // Add type definitions for @thorvg/canvas-kit
    const thorvgTypes = `
declare module '@thorvg/canvas-kit' {
  export interface InitOptions {
    renderer?: 'gl' | 'wg' | 'sw';
    locateFile?: (path: string) => string;
  }

  export interface CanvasOptions {
    width: number;
    height: number;
    renderer?: 'gl' | 'wg' | 'sw';
  }

  export interface ThorVGModule {
    Canvas: new (selector: string, options: CanvasOptions) => Canvas;
    Shape: new () => Shape;
    Text: new () => Text;
    Picture: new () => Picture;
    Animation: new () => Animation;
    LinearGradient: new (x1: number, y1: number, x2: number, y2: number) => LinearGradient;
    RadialGradient: new (cx: number, cy: number, radius: number) => RadialGradient;
    Font: {
      load: (name: string, data: Uint8Array, options?: { format?: string }) => void;
    };
  }

  export interface Canvas {
    add(...items: (Shape | Text | Picture | Animation)[]): void;
    render(): void;
    clear(): void;
    update(): void;
  }

  export interface Shape {
    appendRect(x: number, y: number, w: number, h: number, options?: { rx?: number; ry?: number }): Shape;
    appendCircle(cx: number, cy: number, rx: number, ry: number): Shape;
    moveTo(x: number, y: number): Shape;
    lineTo(x: number, y: number): Shape;
    close(): Shape;
    fill(r: number, g: number, b: number, a?: number): Shape;
    fill(gradient: LinearGradient | RadialGradient): Shape;
    stroke(options: { width: number; color: [number, number, number, number] }): Shape;
    translate(x: number, y: number): Shape;
    rotate(angle: number): Shape;
    scale(scale: number): Shape;
  }

  export interface Text {
    font(name: string): Text;
    text(content: string): Text;
    fontSize(size: number): Text;
    fill(r: number, g: number, b: number, a?: number): Text;
    fill(gradient: LinearGradient | RadialGradient): Text;
    outline(width: number, r: number, g: number, b: number, a?: number): Text;
    align(options: { horizontal?: string; vertical?: string }): Text;
    translate(x: number, y: number): Text;
    rotate(angle: number): Text;
  }

  export interface Picture {
    loadData(data: string | Uint8Array, options: { format: string }): Picture;
    size(width?: number, height?: number): { width: number; height: number } | Picture;
    translate(x: number, y: number): Picture;
  }

  export interface Animation {
    load(data: Uint8Array): void;
    play(callback: (frame: number) => void): void;
    pause(): void;
    isPlaying(): boolean;
    frame(frameNumber: number): void;
    info(): { totalFrames: number; duration: number; fps: number };
    dispose(): void;
    picture: Picture;
  }

  export interface LinearGradient {
    addStop(offset: number, color: [number, number, number, number]): void;
  }

  export interface RadialGradient {
    addStop(offset: number, color: [number, number, number, number]): void;
  }

  export function init(options?: InitOptions): Promise<ThorVGModule>;
}

// Global declarations for playground context
declare const TVG: any;
declare const canvas: any;
`;

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      thorvgTypes,
      'file:///node_modules/@types/thorvg-canvas-kit/index.d.ts'
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
