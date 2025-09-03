import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ResourceType {
  id: string;
  type: string;
  color: string;
  isStaff: boolean;
  createdDate: string;
}

export const useResourceTypes = () => {
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResourceTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resource_types')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedData: ResourceType[] = data.map(item => ({
        id: item.id,
        type: item.type,
        color: item.color,
        isStaff: item.is_staff,
        createdDate: item.created_at.split('T')[0] // Format to YYYY-MM-DD
      }));

      setResourceTypes(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addResourceType = async (resourceType: Omit<ResourceType, 'id' | 'createdDate'>) => {
    try {
      const { data, error } = await supabase
        .from('resource_types')
        .insert({
          type: resourceType.type,
          color: resourceType.color,
          is_staff: resourceType.isStaff
        })
        .select()
        .single();

      if (error) throw error;

      const newResourceType: ResourceType = {
        id: data.id,
        type: data.type,
        color: data.color,
        isStaff: data.is_staff,
        createdDate: data.created_at.split('T')[0]
      };

      setResourceTypes(prev => [...prev, newResourceType]);
      return newResourceType;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource type');
      throw err;
    }
  };

  const updateResourceType = async (id: string, updates: Partial<Omit<ResourceType, 'id' | 'createdDate'>>) => {
    try {
      const dbUpdates: any = {};
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.isStaff !== undefined) dbUpdates.is_staff = updates.isStaff;

      const { data, error } = await supabase
        .from('resource_types')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedResourceType: ResourceType = {
        id: data.id,
        type: data.type,
        color: data.color,
        isStaff: data.is_staff,
        createdDate: data.created_at.split('T')[0]
      };

      setResourceTypes(prev => prev.map(rt => 
        rt.id === id ? updatedResourceType : rt
      ));
      return updatedResourceType;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resource type');
      throw err;
    }
  };

  const deleteResourceType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resource_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResourceTypes(prev => prev.filter(rt => rt.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource type');
      throw err;
    }
  };

  useEffect(() => {
    fetchResourceTypes();
  }, []);

  return {
    resourceTypes,
    loading,
    error,
    addResourceType,
    updateResourceType,
    deleteResourceType,
    refetch: fetchResourceTypes
  };
};