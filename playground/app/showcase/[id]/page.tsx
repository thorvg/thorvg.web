'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CodeEditor from '@/components/CodeEditor';
import CanvasPreview from '@/components/CanvasPreview';
import { getExampleById, showcaseExamples } from '@/lib/examples';

export default function ShowcasePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [example, setExample] = useState(getExampleById(id));
  const [code, setCode] = useState(example?.code || '');
  const [autoRun, setAutoRun] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const foundExample = getExampleById(id);
    if (!foundExample) {
      router.push('/');
      return;
    }
    setExample(foundExample);
    setCode(foundExample.code);
  }, [id, router]);

  if (!example) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Example not found</h2>
          <Link href="/" className="text-[#4a9eff] hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReset = () => {
    setCode(example.code);
  };

  const currentIndex = showcaseExamples.findIndex((ex) => ex.id === id);
  const prevExample = currentIndex > 0 ? showcaseExamples[currentIndex - 1] : null;
  const nextExample =
    currentIndex < showcaseExamples.length - 1 ? showcaseExamples[currentIndex + 1] : null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#2d2d30] border-b border-[#3e3e42] flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
              title="Back to Home"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">{example.title}</h1>
              <p className="text-xs text-gray-400">{example.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(e) => setAutoRun(e.target.checked)}
                className="cursor-pointer"
              />
              Auto Run
            </label>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-[#3c3c3c] hover:bg-[#505050] rounded text-sm text-gray-300 transition-colors"
            >
              Reset
            </button>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-[#3c3c3c] hover:bg-[#505050] rounded text-sm text-gray-300 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Canvas Preview */}
        <div className="flex-1 border-r border-[#3e3e42]">
          <div className="bg-[#2d2d30] px-4 py-2 border-b border-[#3e3e42]">
            <h2 className="text-sm font-semibold text-gray-300">Canvas Preview</h2>
          </div>
          <div className="h-[calc(100%-40px)]">
            <CanvasPreview code={code} autoRun={autoRun} />
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1">
          <div className="bg-[#2d2d30] px-4 py-2 border-b border-[#3e3e42]">
            <h2 className="text-sm font-semibold text-gray-300">Code Editor</h2>
          </div>
          <div className="h-[calc(100%-40px)]">
            <CodeEditor code={code} onChange={setCode} />
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="bg-[#2d2d30] border-t border-[#3e3e42] px-4 py-2 flex items-center justify-between text-sm flex-shrink-0">
        <div>
          {prevExample ? (
            <Link
              href={`/showcase/${prevExample.id}`}
              className="text-[#4a9eff] hover:underline flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous: {prevExample.title}
            </Link>
          ) : (
            <span className="text-gray-600">No previous example</span>
          )}
        </div>

        <div className="text-gray-400">
          {currentIndex + 1} / {showcaseExamples.length}
        </div>

        <div>
          {nextExample ? (
            <Link
              href={`/showcase/${nextExample.id}`}
              className="text-[#4a9eff] hover:underline flex items-center gap-1"
            >
              Next: {nextExample.title}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ) : (
            <span className="text-gray-600">No next example</span>
          )}
        </div>
      </footer>
    </div>
  );
}
