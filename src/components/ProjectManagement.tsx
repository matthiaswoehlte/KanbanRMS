import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, FolderOpen, User, AlertTriangle, Calendar } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useResources } from '../hooks/useResources';
import AddProjectModal from './AddProjectModal';
import EditProjectModal from './EditProjectModal';

interface ProjectManagementProps {
  onProjectSelect?: (projectId: string) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ onProjectSelect }) => {
  const { 
    projects, 
    loading, 
    error, 
    addProject, 
    updateProject, 
    deleteProject 
  } = useProjects();
  
  const { resources } = useResources();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.ownerName && project.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleEdit = (project: any) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the project "${name}"? This will also delete all lanes and tasks.`)) {
      try {
        await deleteProject(id);
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleAddProject = async (projectData: any) => {
    try {
      const newProject = await addProject(projectData);
      setShowAddModal(false);
      return newProject;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateProject = async (id: string, updates: any) => {
    try {
      const updatedProject = await updateProject(id, updates);
      setShowEditModal(false);
      setSelectedProject(null);
      return updatedProject;
    } catch (err) {
      throw err;
    }
  };

  const handleProjectSelect = (projectId: string) => {
    onProjectSelect?.(projectId);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="text-white text-lg">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-red-400 font-semibold">Error Loading Data</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Project Management</h1>
        <p className="text-gray-400">Manage projects and their Kanban boards</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
            <FolderOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Get started by creating your first project'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Project</span>
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.description || 'No description'}</p>
                  
                  {project.ownerName && (
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {(() => {
                          const owner = resources.find(r => r.id === project.ownerId);
                          return owner?.thumbnail ? (
                            <img 
                              src={owner.thumbnail} 
                              alt={project.ownerName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : owner?.picture ? (
                            <img 
                              src={owner.picture} 
                              alt={project.ownerName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null;
                        })()}
                        <User className={`w-4 h-4 text-gray-400 ${(() => {
                          const owner = resources.find(r => r.id === project.ownerId);
                          return owner?.thumbnail || owner?.picture ? 'hidden' : '';
                        })()}`} />
                      </div>
                      <span className="text-sm text-gray-300">{project.ownerName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleProjectSelect(project.id)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Open Board</span>
                </button>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(project)}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id, project.name)}
                    disabled={loading}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{projects.length}</p>
              <p className="text-sm text-gray-400">Total Projects</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{new Set(projects.map(p => p.ownerId).filter(Boolean)).size}</p>
              <p className="text-sm text-gray-400">Project Owners</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {projects.filter(p => new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-gray-400">Created This Month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {projects.filter(p => p.updatedAt !== p.createdAt).length}
              </p>
              <p className="text-sm text-gray-400">Recently Updated</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProject}
        resources={resources}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProject(null);
        }}
        onUpdate={handleUpdateProject}
        project={selectedProject}
        resources={resources}
      />
    </div>
  );
};

export default ProjectManagement;