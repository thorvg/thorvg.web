import Link from 'next/link';
import { showcaseExamples } from '@/lib/examples';

const categoryColors = {
  basic: 'bg-blue-600',
  advanced: 'bg-purple-600',
  animation: 'bg-green-600',
  text: 'bg-yellow-600',
  media: 'bg-pink-600',
};

const categoryLabels = {
  basic: 'Basic',
  advanced: 'Advanced',
  animation: 'Animation',
  text: 'Text',
  media: 'Media',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* Header */}
      {/* <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2b2b2b]">ThorVG Playground</h1>
              <p className="text-sm text-[#737373] mt-1">Interactive examples for ThorVG WebCanvas</p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://github.com/thorvg/thorvg"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#f0f0f0] hover:bg-[#e0e0e0] rounded-md text-sm text-[#2b2b2b] transition-colors"
              >
                GitHub
              </a>
              <a
                href="http://canvas-kit-api-docs.surge.sh/"
                className="px-4 py-2 bg-[#2b2b2b] text-white hover:bg-[#1a1a1a] rounded-md text-sm font-medium transition-colors"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-[#2b2b2b]">Showcase Examples</h2>
          <p className="text-[#737373] text-sm">
            Click on any example to view the code and live preview. All examples include full import statements
            so you can copy and use them directly in your projects.
          </p>
        </div> */}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showcaseExamples.map((example) => (
            <Link
              key={example.id}
              href={`/showcase/${example.id}`}
              target="_blank"
              className="group flex flex-col bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Thumbnail / Preview */}
              <div className="aspect-video bg-white flex items-center justify-center relative overflow-hidden">
                {example.thumbnail ? (
                  <img
                    src={example.thumbnail}
                    alt={example.title}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f0f0f0] to-[#e0e0e0] opacity-50" />
                    <svg
                      className="w-16 h-16 text-[#a0a0a0] relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                      />
                    </svg>
                  </>
                )}
              </div>

              {/* Content - Dark Background */}
              <div className="bg-[#2d2d30] p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-gray-100 transition-colors">
                    {example.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs rounded ${categoryColors[example.category]} text-white font-medium flex-shrink-0 ml-2`}>
                    {categoryLabels[example.category]}
                  </span>
                </div>
                <p className="text-sm text-[#a8a8a8] mb-4 leading-relaxed flex-grow">{example.description}</p>

                {/* Footer Link */}
                <div className="flex items-center text-sm text-[#808080] mt-auto">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  View Code & Preview
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        {/* <div className="mt-12 p-6 bg-white border border-[#e0e0e0] rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-[#2b2b2b]">Getting Started</h3>
          <p className="text-sm text-[#737373] mb-4">
            To use ThorVG WebCanvas in your project, install it via npm or yarn:
          </p>
          <pre className="bg-[#f6f6f6] border border-[#e0e0e0] p-4 rounded-md text-sm overflow-x-auto font-mono">
            <code className="text-[#047857]">npm install @thorvg/webcanvas</code>
            <br />
            <code className="text-[#999999]"># or</code>
            <br />
            <code className="text-[#047857]">yarn add @thorvg/webcanvas</code>
          </pre>
        </div> */}
      </main>
    </div>
  );
}
