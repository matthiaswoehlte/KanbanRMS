import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" in the top right to set up your database connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

export type Database = {
  public: {
    Tables: {
      resource_status: {
        Row: {
          id: string;
          name: string;
          description: string;
          color: string;
          is_active: boolean;
          usage_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          color: string;
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          color?: string;
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          supervisor: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          supervisor: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          supervisor?: string;
          created_at?: string;
        };
      };
      resource_types: {
        Row: {
          id: string;
          type: string;
          color: string;
          is_staff: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          color: string;
          is_staff?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          color?: string;
          is_staff?: boolean;
          created_at?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          name: string;
          picture: string;
          thumbnail: string;
          resource_type_id: string;
          resource_status_id: string;
          department_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          picture?: string;
          thumbnail?: string;
          resource_type_id: string;
          resource_status_id: string;
          department_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          picture?: string;
          thumbnail?: string;
          resource_type_id?: string;
          resource_status_id?: string;
          department_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
};