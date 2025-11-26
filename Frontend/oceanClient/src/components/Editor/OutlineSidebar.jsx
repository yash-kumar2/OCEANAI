// src/components/Editor/OutlineSidebar.jsx
import React from 'react';

export default function OutlineSidebar({ sections, activeIndex, setActiveIndex, generateSectionContent }) {
  return (
    <div className="w-64 border-r bg-white flex flex-col shrink-0 z-10">
      <div className="p-4 border-b"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Structure</h3></div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveIndex(idx); generateSectionContent(idx); }}
            className={`w-full text-left px-3 py-3 text-sm rounded-lg transition flex items-center justify-between group ${activeIndex === idx ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span className="truncate">{idx + 1}. {section.title}</span>
            {section.generated && <div className="w-2 h-2 rounded-full bg-green-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}
