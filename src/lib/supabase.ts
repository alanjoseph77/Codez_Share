import { createClient } from '@supabase/supabase-js';

// Your Supabase URL and Anon Key
const supabaseUrl = 'https://hmdueuwalflzclgncgjs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZHVldXdhbGZsemNsZ25jZ2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MDY0MDIsImV4cCI6MjA3NzM4MjQwMn0.dK0gZM5mFIg3NpVaYWhDFatHMzoxHme2Ya5qhRmb8zU';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Document = {
  id: string;
  content: string;
  title: string;
  created_at: string;
  updated_at: string;
};
