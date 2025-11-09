import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

export default function StoryModal({ story, onClose, onNext, onPrev }) {
  useEffect(() => {
    const el = document.getElementById('modal-root');
    if (!el) {
      const div = document.createElement('div');
      div.id = 'modal-root';
      document.body.appendChild(div);
    }
    // fade-in animation
    gsap.from('.modal-card', { duration: 0.5, y: 20, opacity: 0, ease: 'power3.out' });
  }, []);

  if (!story) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="modal-card relative w-[min(900px,95%)] max-h-[90vh] overflow-auto bg-white text-black rounded-lg p-6 z-10">
        <button
          className="absolute top-3 right-3 text-sm px-3 py-1 rounded hover:bg-gray-200"
          onClick={onClose}
          aria-label="Close story"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-3">{story.title}</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {story.media?.imageUrl ? (
            <img
              src={story.media.imageUrl}
              alt={story.title}
              className="w-full md:w-1/3 h-auto rounded"
            />
          ) : null}
          <div className="flex-1">
            <p className="mb-4 text-gray-700">{story.content}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                ← Prev
              </button>
              <button
                onClick={onNext}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.getElementById('modal-root'));
}
