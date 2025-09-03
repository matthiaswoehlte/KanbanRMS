import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UserPreferences {
  id: string;
  userId: string;
  lastProjectId: string | null;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const useUserPreferences = (userId: string) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        const formattedData: UserPreferences = {
          id: data.id,
          userId: data.user_id,
          lastProjectId: data.last_project_id,
          preferences: data.preferences || {},
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        setPreferences(formattedData);
      } else {
        // Create default preferences if none exist
        const { data: newData, error: createError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            preferences: {}
          })
          .select()
          .single();

        if (createError) throw createError;

        const newPreferences: UserPreferences = {
          id: newData.id,
          userId: newData.user_id,
          lastProjectId: newData.last_project_id,
          preferences: newData.preferences || {},
          createdAt: newData.created_at,
          updatedAt: newData.updated_at
        };
        setPreferences(newPreferences);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  };

  const updateLastProject = async (projectId: string | null) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ last_project_id: projectId })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedPreferences: UserPreferences = {
        id: data.id,
        userId: data.user_id,
        lastProjectId: data.last_project_id,
        preferences: data.preferences || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update last project');
      throw err;
    }
  };

  const updatePreferences = async (newPreferences: Record<string, any>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ preferences: newPreferences })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedPreferences: UserPreferences = {
        id: data.id,
        userId: data.user_id,
        lastProjectId: data.last_project_id,
        preferences: data.preferences || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  };

  const updateCollapseTiles = async (projectId: string, collapsed: boolean) => {
    if (!userId) return;

    try {
      const currentPrefs = preferences?.preferences || {};
      const projectPrefs = currentPrefs[projectId] || {};
      
      const newPreferences = {
        ...currentPrefs,
        [projectId]: {
          ...projectPrefs,
          collapseTiles: collapsed
        }
      };

      await updatePreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collapse tiles preference');
      throw err;
    }
  };

  const getCollapseTiles = (projectId: string): boolean => {
    if (!preferences?.preferences || !projectId) return false;
    return preferences.preferences[projectId]?.collapseTiles || false;
  };
  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  return {
    preferences,
    loading,
    error,
    updateLastProject,
    updatePreferences,
    updateCollapseTiles,
    getCollapseTiles,
    refetch: fetchPreferences
  };
};