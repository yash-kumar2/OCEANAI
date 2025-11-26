// src/components/Dashboard.jsx
import React from 'react';
import { Plus, LogOut, FileText, Monitor } from 'lucide-react';

export default function Dashboard({ userEmail, projects, setView, setCurrentProject, handleLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
            <p className="text-gray-500">Welcome back, {userEmail}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"><LogOut size={20} /> Logout</button>
            <button onClick={() => { setView('wizard'); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"><Plus size={20} /> New Project</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-gray-400 mb-4">No projects found.</p>
              <button onClick={() => setView('wizard')} className="text-blue-600 font-medium hover:underline">Start a new document</button>
            </div>
          ) : (
            projects.map(p => (
              <div key={p._id} onClick={() => { setCurrentProject(p); setView('editor'); }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${p.type === 'docx' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{p.type === 'docx' ? <FileText size={24} /> : <Monitor size={24} />}</div>
                </div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2 truncate">{p.topic}</h3>
                <p className="text-sm text-gray-500">{p.sections.length} Sections • {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
