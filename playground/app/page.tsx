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
      <main className="max-w-7xl mx-auto px-6 py-8">
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
      </main>
    </div>
  );
}
