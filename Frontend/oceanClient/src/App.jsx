// src/App.jsx
import React, { useEffect, useState } from 'react';
import { apiCall } from './api';
import AuthPanel from './components/AuthPanel';
import Dashboard from './components/Dashboard';
import Wizard from './components/Wizard';
import EditorView from './components/Editor/EditorView';

const App = () => {
  // --- STATE (mostly same as your original app) ---
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email') || '');
  const [view, setView] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auth
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Wizard
  const [wizardData, setWizardData] = useState({ type: 'docx', topic: '' });

  // Editor
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (token) loadProjects();
  }, [token]);

  const loadProjects = async () => {
    try {
      const data = await apiCall(token, '/projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load failed", e);
    }
  };

  // --- AUTH HANDLERS (kept simple; same endpoints as your original) ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await fetch(`${'http://localhost:5000/api'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
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
    setUserEmail('');
    setProjects([]);
    setCurrentProject(null);
    setView('dashboard');
  };

  // --- PROJECT CREATION + CONTENT GENERATION ---
  const handleCreateProject = async () => {
    if (!wizardData.topic) return alert("Please enter a topic");
    setLoading(true);
    try {
      const project = await apiCall(token, '/projects', 'POST', wizardData);
      const outlineData = await apiCall(token, `/projects/${project._id}/generate-outline`, 'POST');
      const fullProject = { ...project, sections: outlineData.sections };
      setProjects([fullProject, ...projects]);
      setCurrentProject(fullProject);
      setView('editor');
      generateSectionContent(fullProject, 0);
    } catch (e) {
      alert(e.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const generateSectionContent = async (projectOrId, index) => {
    setLoading(true);
    try {
      const project = typeof projectOrId === 'string' ? projects.find(p => p._id === projectOrId) : projectOrId;
      const section = project.sections[index];
      if (section.generated && section.content && section.content.length > 0) { setLoading(false); return; }

      const data = await apiCall(token, `/projects/${project._id}/sections/generate`, 'POST', { index });
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
    if (!refinementPrompt || !currentProject) return;
    setLoading(true);
    try {
      const data = await apiCall(token, `/projects/${currentProject._id}/sections/refine`, 'POST', {
        index: activeSectionIndex,
        instruction: refinementPrompt
      });
      const updatedSections = [...currentProject.sections];
      updatedSections[activeSectionIndex] = { ...updatedSections[activeSectionIndex], content: data.content };
      const updatedProject = { ...currentProject, sections: updatedSections };
      setCurrentProject(updatedProject);
      setRefinementPrompt("");
    } catch (e) {
      alert(e.message || 'Refine failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpdate = async (updatedProject) => {
    setCurrentProject(updatedProject);
    try {
      await apiCall(token, `/projects/${updatedProject._id}`, 'PUT', { sections: updatedProject.sections });
    } catch (e) { console.error("Auto-save failed", e); }
  };

  const handleExport = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const blob = await apiCall(token, `/projects/${currentProject._id}/export`);
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
    if(!comment || !currentProject) return;
    const updatedSections = [...currentProject.sections];
    updatedSections[activeSectionIndex].comments.push(comment);
    handleManualUpdate({ ...currentProject, sections: updatedSections });
    setComment("");
  };

  const toggleFeedback = (type) => {
    if(!currentProject) return;
    const updatedSections = [...currentProject.sections];
    const currentVal = updatedSections[activeSectionIndex].feedback;
    updatedSections[activeSectionIndex].feedback = currentVal === type ? null : type;
    handleManualUpdate({ ...currentProject, sections: updatedSections });
  };

  // --- RENDER SWITCHER ---
  if (!token) {
    return (
      <AuthPanel
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        authData={authData}
        setAuthData={setAuthData}
        handleAuth={handleAuth}
        authError={authError}
        loading={loading}
      />
    );
  }

  if (view === 'dashboard') {
    return <Dashboard userEmail={userEmail} projects={projects} setView={setView} setCurrentProject={(p)=>{setCurrentProject(p); setActiveSectionIndex(0);}} handleLogout={handleLogout} />;
  }

  if (view === 'wizard') {
    return <Wizard wizardData={wizardData} setWizardData={setWizardData} setView={setView} handleCreateProject={handleCreateProject} loading={loading} />;
  }

  if (view === 'editor' && currentProject) {
    return (
      <EditorView
        currentProject={currentProject}
        activeSectionIndex={activeSectionIndex}
        setActiveSectionIndex={setActiveSectionIndex}
        generateSectionContent={generateSectionContent}
        loading={loading}
        refinementPrompt={refinementPrompt}
        setRefinementPrompt={setRefinementPrompt}
        handleRefine={handleRefine}
        comment={comment}
        setComment={setComment}
        saveComment={saveComment}
        toggleFeedback={toggleFeedback}
        handleExport={handleExport}
        setView={setView}
      />
    );
  }

  return <div className="flex items-center justify-center h-screen">Loading...</div>;
};

export default App;
