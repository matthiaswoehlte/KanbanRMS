import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Department {
  id: string;
  name: string;
  supervisor: string;
  createdDate: string;
}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedData: Department[] = data.map(item => ({
        id: item.id,
        name: item.name,
        supervisor: item.supervisor,
        createdDate: item.created_at.split('T')[0] // Format to YYYY-MM-DD
      }));

      setDepartments(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (department: Omit<Department, 'id' | 'createdDate'>) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: department.name,
          supervisor: department.supervisor
        })
        .select()
        .single();

      if (error) throw error;

      const newDepartment: Department = {
        id: data.id,
        name: data.name,
        supervisor: data.supervisor,
        createdDate: data.created_at.split('T')[0]
      };

      setDepartments(prev => [...prev, newDepartment]);
      return newDepartment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add department');
      throw err;
    }
  };

  const updateDepartment = async (id: string, updates: Partial<Omit<Department, 'id' | 'createdDate'>>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.supervisor !== undefined) dbUpdates.supervisor = updates.supervisor;

      const { data, error } = await supabase
        .from('departments')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedDepartment: Department = {
        id: data.id,
        name: data.name,
        supervisor: data.supervisor,
        createdDate: data.created_at.split('T')[0]
      };

      setDepartments(prev => prev.map(dept => 
        dept.id === id ? updatedDepartment : dept
      ));
      return updatedDepartment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update department');
      throw err;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDepartments(prev => prev.filter(dept => dept.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
      throw err;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    refetch: fetchDepartments
  };
};