// src/components/Wizard.jsx
import React from 'react';
import { ArrowLeft, Monitor, FileText, Loader } from 'lucide-react';

export default function Wizard({ wizardData, setWizardData, setView, handleCreateProject, loading }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-lg">
        <button onClick={() => setView('dashboard')} className="flex items-center text-gray-400 hover:text-gray-600 mb-6 text-sm">
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Document</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setWizardData({ ...wizardData, type: 'docx' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${wizardData.type === 'docx' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                <FileText size={24} /> <span className="font-medium">Word Report</span>
              </button>
              <button onClick={() => setWizardData({ ...wizardData, type: 'pptx' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${wizardData.type === 'pptx' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'}`}>
                <Monitor size={24} /> <span className="font-medium">PowerPoint</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic or Prompt</label>
            <textarea value={wizardData.topic} onChange={(e) => setWizardData({ ...wizardData, topic: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none" placeholder="E.g., A strategic analysis of the EV market in 2025..." />
          </div>
          <button onClick={handleCreateProject} disabled={loading || !wizardData.topic} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
            {loading ? <Loader className="animate-spin" /> : <Monitor />} Generate Outline
          </button>
        </div>
      </div>
    </div>
  );
}
