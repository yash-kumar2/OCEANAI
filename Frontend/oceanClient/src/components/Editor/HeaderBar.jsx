// src/components/Editor/HeaderBar.jsx
import React from 'react';
import { Layout, Download, Loader } from 'lucide-react';

export default function HeaderBar({ currentProject, setView, handleExport, loading }) {
  return (
    <div className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
          <Layout size={20} className="text-gray-600" />
        </button>
        <h2 className="font-semibold text-gray-800 truncate max-w-md">{currentProject.topic}</h2>
        <span className={`text-xs px-2 py-1 rounded ${currentProject.type === 'docx' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{currentProject.type.toUpperCase()}</span>
      </div>
      <button onClick={handleExport} disabled={loading} className="flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
        {loading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />} Export
      </button>
    </div>
  );
}
