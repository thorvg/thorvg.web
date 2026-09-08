'use client';

export function DragOverlay({ message = 'Drop .json file to spawn' }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="border-2 border-dashed border-brand rounded-xl px-10 py-8 bg-gray-900/90 text-brand text-sm font-semibold">
        {message}
      </div>
    </div>
  );
}
