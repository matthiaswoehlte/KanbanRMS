import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Resource {
  id: string;
  name: string;
  picture: string;
  thumbnail: string;
  resourceTypeId: string;
  resourceTypeName: string;
  resourceTypeColor: string;
  resourceTypeIsStaff: boolean;
  resourceStatusId: string;
  resourceStatusName: string;
  resourceStatusColor: string;
  departmentId: string | null;
  departmentName: string | null;
  createdDate: string;
}

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          resource_types!inner(id, type, color, is_staff),
          resource_status!inner(id, name, color),
          departments(id, name)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedData: Resource[] = data.map(item => ({
        id: item.id,
        name: item.name,
        picture: item.picture || '',
        thumbnail: item.thumbnail || '',
        resourceTypeId: item.resource_type_id,
        resourceTypeName: item.resource_types.type,
        resourceTypeColor: item.resource_types.color,
        resourceTypeIsStaff: item.resource_types.is_staff,
        resourceStatusId: item.resource_status_id,
        resourceStatusName: item.resource_status.name,
        resourceStatusColor: item.resource_status.color,
        departmentId: item.department_id,
        departmentName: item.departments?.name || null,
        createdDate: item.created_at.split('T')[0]
      }));

      setResources(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resource: {
    name: string;
    picture: string;
    thumbnail: string;
    resourceTypeId: string;
    resourceStatusId: string;
    departmentId?: string;
  }) => {
    try {
      const insertData: any = {
        name: resource.name,
        picture: resource.picture,
        thumbnail: resource.thumbnail,
        resource_type_id: resource.resourceTypeId,
        resource_status_id: resource.resourceStatusId
      };

      if (resource.departmentId) {
        insertData.department_id = resource.departmentId;
      }

      const { data, error } = await supabase
        .from('resources')
        .insert(insertData)
        .select(`
          *,
          resource_types!inner(id, type, color, is_staff),
          resource_status!inner(id, name, color),
          departments(id, name)
        `)
        .single();

      if (error) throw error;

      const newResource: Resource = {
        id: data.id,
        name: data.name,
        picture: data.picture || '',
        thumbnail: data.thumbnail || '',
        resourceTypeId: data.resource_type_id,
        resourceTypeName: data.resource_types.type,
        resourceTypeColor: data.resource_types.color,
        resourceTypeIsStaff: data.resource_types.is_staff,
        resourceStatusId: data.resource_status_id,
        resourceStatusName: data.resource_status.name,
        resourceStatusColor: data.resource_status.color,
        departmentId: data.department_id,
        departmentName: data.departments?.name || null,
        createdDate: data.created_at.split('T')[0]
      };

      setResources(prev => [...prev, newResource]);
      return newResource;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource');
      throw err;
    }
  };

  const updateResource = async (id: string, updates: {
    name?: string;
    picture?: string;
    thumbnail?: string;
    resourceTypeId?: string;
    resourceStatusId?: string;
    departmentId?: string;
  }) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.picture !== undefined) dbUpdates.picture = updates.picture;
      if (updates.thumbnail !== undefined) dbUpdates.thumbnail = updates.thumbnail;
      if (updates.resourceTypeId !== undefined) dbUpdates.resource_type_id = updates.resourceTypeId;
      if (updates.resourceStatusId !== undefined) dbUpdates.resource_status_id = updates.resourceStatusId;
      if (updates.departmentId !== undefined) {
        dbUpdates.department_id = updates.departmentId || null;
      }

      const { data, error } = await supabase
        .from('resources')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          resource_types!inner(id, type, color, is_staff),
          resource_status!inner(id, name, color),
          departments(id, name)
        `)
        .single();

      if (error) throw error;

      const updatedResource: Resource = {
        id: data.id,
        name: data.name,
        picture: data.picture || '',
        thumbnail: data.thumbnail || '',
        resourceTypeId: data.resource_type_id,
        resourceTypeName: data.resource_types.type,
        resourceTypeColor: data.resource_types.color,
        resourceTypeIsStaff: data.resource_types.is_staff,
        resourceStatusId: data.resource_status_id,
        resourceStatusName: data.resource_status.name,
        resourceStatusColor: data.resource_status.color,
        departmentId: data.department_id,
        departmentName: data.departments?.name || null,
        createdDate: data.created_at.split('T')[0]
      };

      setResources(prev => prev.map(resource => 
        resource.id === id ? updatedResource : resource
      ));
      return updatedResource;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resource');
      throw err;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResources(prev => prev.filter(resource => resource.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource');
      throw err;
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const generateThumbnailsForAll = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all resources that have a picture but no thumbnail
      const resourcesToUpdate = resources.filter(resource => 
        resource.picture && resource.picture.trim() !== '' && !resource.thumbnail
      );
      
      if (resourcesToUpdate.length === 0) {
        alert('No resources need thumbnail generation.');
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const resource of resourcesToUpdate) {
        try {
          // Import createThumbnail dynamically to avoid circular imports
          const { createThumbnail } = await import('../utils/imageUtils');
          const thumbnail = await createThumbnail(resource.picture, 43);
          
          // Update the resource in the database
          const { error: updateError } = await supabase
            .from('resources')
            .update({ thumbnail })
            .eq('id', resource.id);
          
          if (updateError) {
            console.error(`Failed to update resource ${resource.id}:`, updateError);
            errorCount++;
          } else {
            successCount++;
            // Update local state
            setResources(prev => prev.map(r => 
              r.id === resource.id ? { ...r, thumbnail } : r
            ));
          }
        } catch (err) {
          console.error(`Failed to generate thumbnail for resource ${resource.id}:`, err);
          errorCount++;
        }
      }
      
      alert(`Thumbnail generation complete!\nSuccess: ${successCount}\nErrors: ${errorCount}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate thumbnails');
    } finally {
      setLoading(false);
    }
  };

  return {
    resources,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
    refetch: fetchResources
  };
};