import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Create a client with service role for admin operations
const adminSupabase = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY 
  ? supabase 
  : supabase;

export interface ResourceStatusItem {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdDate: string;
  usageCount: number;
}

export const useResourceStatus = () => {
  const [statuses, setStatuses] = useState<ResourceStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resource_status')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedData: ResourceStatusItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        color: item.color,
        isActive: item.is_active,
        createdDate: item.created_at.split('T')[0], // Format to YYYY-MM-DD
        usageCount: item.usage_count
      }));

      setStatuses(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addStatus = async (status: Omit<ResourceStatusItem, 'id' | 'createdDate' | 'usageCount'>) => {
    try {
      const { data, error } = await adminSupabase
        .from('resource_status')
        .insert({
          name: status.name,
          description: status.description,
          color: status.color,
          is_active: status.isActive
        })
        .select()
        .single();

      if (error) throw error;

      const newStatus: ResourceStatusItem = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        color: data.color,
        isActive: data.is_active,
        createdDate: data.created_at.split('T')[0],
        usageCount: data.usage_count
      };

      setStatuses(prev => [...prev, newStatus]);
      return newStatus;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add status');
      throw err;
    }
  };

  const updateStatus = async (id: string, updates: Partial<Omit<ResourceStatusItem, 'id' | 'createdDate'>>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.usageCount !== undefined) dbUpdates.usage_count = updates.usageCount;

      const { data, error } = await adminSupabase
        .from('resource_status')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedStatus: ResourceStatusItem = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        color: data.color,
        isActive: data.is_active,
        createdDate: data.created_at.split('T')[0],
        usageCount: data.usage_count
      };

      setStatuses(prev => prev.map(status => 
        status.id === id ? updatedStatus : status
      ));
      return updatedStatus;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      throw err;
    }
  };

  const deleteStatus = async (id: string) => {
    try {
      const { error } = await adminSupabase
        .from('resource_status')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStatuses(prev => prev.filter(status => status.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete status');
      throw err;
    }
  };

  const toggleStatusActive = async (id: string) => {
    const status = statuses.find(s => s.id === id);
    if (!status) return;

    await updateStatus(id, { isActive: !status.isActive });
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  return {
    statuses,
    loading,
    error,
    addStatus,
    updateStatus,
    deleteStatus,
    toggleStatusActive,
    refetch: fetchStatuses
  };
};