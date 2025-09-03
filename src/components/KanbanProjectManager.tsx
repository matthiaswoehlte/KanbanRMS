import React, { useState, useEffect } from 'react';
import { FolderKanban } from 'lucide-react';
import ProjectManagement from './ProjectManagement';
import KanbanBoard from './KanbanBoard';
import { useUserPreferences } from '../hooks/useUserPreferences';

const KanbanProjectManager: React.FC = () => {
  const [currentView, setCurrentView] = useState<'projects' | 'kanban'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Use a simple user ID for demo purposes - in production this would come from auth
  const userId = 'demo-user';
  const { preferences, updateLastProject } = useUserPreferences(userId);

  // Load last project on mount
  useEffect(() => {
    if (preferences?.lastProjectId) {
      setSelectedProjectId(preferences.lastProjectId);
      setCurrentView('kanban');
    }
  }, [preferences]);

  const handleProjectSelect = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('kanban');
    
    // Save as last project
    try {
      await updateLastProject(projectId);
    } catch (err) {
      console.error('Failed to save last project:', err);
    }
  };

  const handleBackToProjects = () => {
    setCurrentView('projects');
    setSelectedProjectId(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {currentView === 'projects' ? (
        <ProjectManagement onProjectSelect={handleProjectSelect} />
      ) : (
        <KanbanBoard 
          projectId={selectedProjectId}
          onBackToProjects={handleBackToProjects}
        />
      )}
    </div>
  );
};

export default KanbanProjectManager;