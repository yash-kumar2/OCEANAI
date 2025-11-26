// src/components/Editor/ToolsSidebar.jsx
import React from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function ToolsSidebar({ currentSection, comment, setComment, saveComment, toggleFeedback }) {
  return (
    <div className="w-80 border-l bg-white flex flex-col shrink-0 z-10">
      <div className="p-4 border-b"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Feedback & Notes</h3></div>
      <div className="p-6 border-b space-y-4">
        <p className="text-sm text-gray-600 font-medium">Was this generation helpful?</p>
        <div className="flex gap-4">
          <button onClick={() => toggleFeedback('like')} className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${currentSection.feedback === 'like' ? 'bg-green-50 border-green-200 text-green-700' : 'hover:bg-gray-50'}`}><ThumbsUp size={18} /> Like</button>
          <button onClick={() => toggleFeedback('dislike')} className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 transition ${currentSection.feedback === 'dislike' ? 'bg-red-50 border-red-200 text-red-700' : 'hover:bg-gray-50'}`}><ThumbsDown size={18} /> Dislike</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><MessageSquare size={16} /> Comments</h4>
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {currentSection.comments.map((c, i) => (
            <div key={i} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-gray-700">{c}</div>
          ))}
        </div>
        <div className="mt-auto">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border rounded-lg p-2 text-sm h-20 resize-none mb-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Add a note..." />
          <button onClick={saveComment} className="w-full bg-gray-800 text-white text-sm py-2 rounded-lg hover:bg-gray-900">Add Comment</button>
        </div>
      </div>
    </div>
  );
}
