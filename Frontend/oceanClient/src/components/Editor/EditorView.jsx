// src/components/Editor/EditorView.jsx
import React from 'react';
import HeaderBar from './HeaderBar';
import OutlineSidebar from './OutlineSidebar';
import ToolsSidebar from './ToolsSidebar';
import MarkdownRenderer from '../MarkdownRenderer';
import { Loader, Edit3 } from 'lucide-react';

export default function EditorView({
  currentProject,
  activeSectionIndex,
  setActiveSectionIndex,
  generateSectionContent,
  loading,
  refinementPrompt,
  setRefinementPrompt,
  handleRefine,
  comment, setComment, saveComment, toggleFeedback, handleExport, setView
}) {
  const currentSection = currentProject.sections[activeSectionIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden font-sans">
      <HeaderBar currentProject={currentProject} setView={setView} handleExport={handleExport} loading={loading} />
      <div className="flex-1 flex overflow-hidden">
        <OutlineSidebar sections={currentProject.sections} activeIndex={activeSectionIndex} setActiveIndex={setActiveSectionIndex} generateSectionContent={(idx) => generateSectionContent(currentProject, idx)} />
        <div className="flex-1 flex flex-col bg-gray-100 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <div className="bg-white rounded-none md:rounded-lg shadow-lg border border-gray-200 min-h-[800px] flex flex-col">
              <div className="p-10 border-b border-gray-50">
                <h1 className="text-3xl font-serif text-gray-900 mb-2">{currentSection.title}</h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Draft • {currentProject.type}</p>
              </div>

              <div className="flex-1 p-10">
                {loading && !currentSection.content ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-4">
                    <Loader className="animate-spin" size={32} />
                    <p className="text-sm">Generating content with AI...</p>
                  </div>
                ) : (
                  <MarkdownRenderer text={currentSection.content} />
                )}
              </div>
            </div>

            <div className="mt-6 bg-white p-4 rounded-xl shadow-md border border-gray-200 flex gap-2 sticky bottom-4 z-20">
              <input
                type="text" value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                placeholder={`Ask AI to refine this page...`}
                className="flex-1 border-gray-200 border rounded-lg px-4 focus:outline-none focus:border-blue-500"
              />
              <button onClick={handleRefine} disabled={loading} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {loading ? <Loader size={20} className="animate-spin"/> : <Edit3 size={20} />}
              </button>
            </div>
          </div>
        </div>

        <ToolsSidebar currentSection={currentSection} comment={comment} setComment={setComment} saveComment={saveComment} toggleFeedback={toggleFeedback} />
      </div>
    </div>
  );
}
