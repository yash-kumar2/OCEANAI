import React, { useState, useEffect } from 'react';
import { 
  FileText, Monitor, Plus, Download, Edit3, 
  ThumbsUp, ThumbsDown, MessageSquare, ChevronRight, 
  Loader, Save, ArrowLeft, Layout, LogOut, Lock, User
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

// --- Utility: Markdown Renderer ---
const renderStyledText = (text) => {
  if (!text) return <p className="text-gray-400 italic">No content generated.</p>;
  
  return text.split('\n').map((line, i) => {
    // Basic Markdown Parsing for **bold**
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

const App = () => {
  // --- STATE ---
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email'));
  
  const [view, setView] = useState('dashboard'); 
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Wizard State
  const [wizardData, setWizardData] = useState({ type: 'docx', topic: '' });

  // Editor State
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [comment, setComment] = useState("");

  // --- HELPER: AUTHENTICATED FETCH ---
  const apiCall = async (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      if (res.status === 401) {
        handleLogout();
        throw new Error("Session expired");
      }
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }
      return await res.blob(); 
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    if (token) loadProjects();
  }, [token]);

  const loadProjects = async () => {
    try {
      const data = await apiCall('/projects');
      setProjects(data);
    } catch (e) { console.error("Load failed", e); }
  };

  // --- ACTIONS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      setToken(data.token);
      setUserEmail(data.email);
      setView('dashboard');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    setUserEmail(null);
    setProjects([]);
    setCurrentProject(null);
  };

  const handleCreateProject = async () => {
    if (!wizardData.topic) return alert("Please enter a topic");
    setLoading(true);
    try {
      const project = await apiCall('/projects', 'POST', wizardData);
      const outlineData = await apiCall(`/projects/${project._id}/generate-outline`, 'POST');
      const fullProject = { ...project, sections: outlineData.sections };
      setProjects([fullProject, ...projects]);
      setCurrentProject(fullProject);
      setView('editor');
      generateSectionContent(fullProject, 0);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSectionContent = async (project, index) => {
    const section = project.sections[index];
    if (section.generated && section.content.length > 0) return;
    setLoading(true);
    try {
      const data = await apiCall(`/projects/${project._id}/sections/generate`, 'POST', { index });
      const updatedSections = [...project.sections];
      updatedSections[index] = { ...section, content: data.content, generated: true };
      const updatedProject = { ...project, sections: updatedSections };
      setCurrentProject(updatedProject);
      setProjects(projects.map(p => p._id === project._id ? updatedProject : p));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementPrompt) return;
    setLoading(true);
    try {
      const data = await apiCall(`/projects/${currentProject._id}/sections/refine`, 'POST', {
        index: activeSectionIndex,
        instruction: refinementPrompt
      });
      const updatedSections = [...currentProject.sections];
      updatedSections[activeSectionIndex] = { ...updatedSections[activeSectionIndex], content: data.content };
      const updatedProject = { ...currentProject, sections: updatedSections };
      setCurrentProject(updatedProject);
      setRefinementPrompt("");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpdate = async (updatedProject) => {
    setCurrentProject(updatedProject);
    try {
      await apiCall(`/projects/${updatedProject._id}`, 'PUT', { sections: updatedProject.sections });
    } catch (e) { console.error("Auto-save failed", e); }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await apiCall(`/projects/${currentProject._id}/export`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.topic.replace(/ /g, '_')}.${currentProject.type}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Export failed");
    } finally {
      setLoading(false);
    }
  };

  const saveComment = () => {
    if(!comment) return;
    const updatedSections = [...currentProject.sections];
    updatedSections[activeSectionIndex].comments.push(comment);
    handleManualUpdate({ ...currentProject, sections: updatedSections });
    setComment("");
  };

  const toggleFeedback = (type) => {
    const updatedSections = [...currentProject.sections];
    const currentVal = updatedSections[activeSectionIndex].feedback;
    updatedSections[activeSectionIndex].feedback = currentVal === type ? null : type;
    handleManualUpdate({ ...currentProject, sections: updatedSections });
  };

  // --- COMPONENT: AUTH ---
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Lock size={32} /></div>
            <h1 className="text-2xl font-bold text-gray-800">AI Document Author</h1>
            <p className="text-gray-500">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})}/>
            </div>
            {authError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{authError}</div>}
            <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center">{loading ? <Loader className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}</button>
          </form>
          <div className="mt-6 text-center text-sm"><button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">{isLogin ? "Don't have an account? Register" : "Already have an account? Login"}</button></div>
        </div>
      </div>
    );
  }

  // --- COMPONENT: DASHBOARD ---
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div><h1 className="text-3xl font-bold text-gray-800">My Projects</h1><p className="text-gray-500">Welcome back, {userEmail}</p></div>
            <div className="flex gap-4">
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"><LogOut size={20} /> Logout</button>
              <button onClick={() => { setView('wizard'); setWizardData({type:'docx', topic:''}); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"><Plus size={20} /> New Project</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm"><p className="text-gray-400 mb-4">No projects found.</p><button onClick={() => setView('wizard')} className="text-blue-600 font-medium hover:underline">Start a new document</button></div>
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

  // --- COMPONENT: WIZARD ---
  if (view === 'wizard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-lg">
          <button onClick={() => setView('dashboard')} className="flex items-center text-gray-400 hover:text-gray-600 mb-6 text-sm"><ArrowLeft size={16} className="mr-1" /> Back to Dashboard</button>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Document</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setWizardData({ ...wizardData, type: 'docx' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${wizardData.type === 'docx' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}><FileText size={24} /> <span className="font-medium">Word Report</span></button>
                <button onClick={() => setWizardData({ ...wizardData, type: 'pptx' })} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${wizardData.type === 'pptx' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'}`}><Monitor size={24} /> <span className="font-medium">PowerPoint</span></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic or Prompt</label>
              <textarea value={wizardData.topic} onChange={(e) => setWizardData({ ...wizardData, topic: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none" placeholder="E.g., A strategic analysis of the EV market in 2025..." />
            </div>
            <button onClick={handleCreateProject} disabled={loading || !wizardData.topic} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">{loading ? <Loader className="animate-spin" /> : <Monitor />} Generate Outline</button>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPONENT: EDITOR (Updated Layout) ---
  if (view === 'editor' && currentProject) {
    const currentSection = currentProject.sections[activeSectionIndex];

    return (
      <div className="h-screen flex flex-col bg-gray-100 overflow-hidden font-sans">
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg"><Layout size={20} className="text-gray-600" /></button>
            <h2 className="font-semibold text-gray-800 truncate max-w-md">{currentProject.topic}</h2>
            <span className={`text-xs px-2 py-1 rounded ${currentProject.type === 'docx' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{currentProject.type.toUpperCase()}</span>
          </div>
          <button onClick={handleExport} disabled={loading} className="flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">{loading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />} Export</button>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Outline Sidebar */}
          <div className="w-64 border-r bg-white flex flex-col shrink-0 z-10">
            <div className="p-4 border-b"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Structure</h3></div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {currentProject.sections.map((section, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveSectionIndex(idx); generateSectionContent(currentProject, idx); }}
                  className={`w-full text-left px-3 py-3 text-sm rounded-lg transition flex items-center justify-between group ${activeSectionIndex === idx ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="truncate">{idx + 1}. {section.title}</span>
                  {section.generated && <div className="w-2 h-2 rounded-full bg-green-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area (Paper View) */}
          <div className="flex-1 flex flex-col bg-gray-100 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
              {/* Paper Element */}
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
                    <div className="prose prose-lg max-w-none text-gray-700">
                      {renderStyledText(currentSection.content)}
                    </div>
                  )}
                </div>
              </div>

              {/* Refinement Bar (Floating) */}
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

          {/* Tools Sidebar */}
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
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
};

export default App;