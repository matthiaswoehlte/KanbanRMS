import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string | null;
  ownerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          resources(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Project[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        ownerId: item.owner_id,
        ownerName: item.resources?.name || null,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setProjects(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project: {
    name: string;
    description: string;
    ownerId?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          owner_id: project.ownerId || null
        })
        .select(`
          *,
          resources(name)
        `)
        .single();

      if (error) throw error;

      // Initialize default lanes for the new project
      const { error: lanesError } = await supabase
        .rpc('initialize_default_lanes', { project_id_param: data.id });

      if (lanesError) throw lanesError;

      const newProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        ownerId: data.owner_id,
        ownerName: data.resources?.name || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add project');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: {
    name?: string;
    description?: string;
    ownerId?: string;
  }) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.ownerId !== undefined) dbUpdates.owner_id = updates.ownerId;

      const { data, error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          resources(name)
        `)
        .single();

      if (error) throw error;

      const updatedProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        ownerId: data.owner_id,
        ownerName: data.resources?.name || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setProjects(prev => prev.map(project => 
        project.id === id ? updatedProject : project
      ));
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
};