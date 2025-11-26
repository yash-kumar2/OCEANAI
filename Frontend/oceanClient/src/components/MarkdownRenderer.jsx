// src/components/MarkdownRenderer.jsx
import React from 'react';

const renderStyledText = (text) => {
  if (!text) return <p className="text-gray-400 italic">No content generated.</p>;

  return text.split('\n').map((line, i) => {
    const parts = line.split('**');
    return (
      <div key={i} className="mb-2 min-h-[1.5em] leading-relaxed">
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="font-bold text-gray-900">{part}</strong> : part
        )}
      </div>
    );
  });
};

export default function MarkdownRenderer({ text }) {
  return <div className="prose prose-lg max-w-none text-gray-700">{renderStyledText(text)}</div>;
}
