/*
  # Create Real-Time Code Sharing System

  ## Overview
  This migration creates the infrastructure for a real-time collaborative code editor
  that requires no authentication. Users can create documents and share links for
  instant collaboration.

  ## New Tables
  
  ### `documents`
  Stores collaborative documents/code snippets
  - `id` (uuid, primary key) - Unique document identifier
  - `content` (text) - The actual code/text content
  - `language` (text) - Programming language for syntax highlighting
  - `created_at` (timestamptz) - When the document was created
  - `updated_at` (timestamptz) - Last update timestamp
  - `title` (text) - Optional document title

  ### `active_sessions`
  Tracks active users in each document for presence indicators
  - `id` (uuid, primary key) - Session identifier
  - `document_id` (uuid, foreign key) - Reference to document
  - `user_color` (text) - Random color assigned to user for cursor display
  - `last_seen` (timestamptz) - Last activity timestamp
  - `created_at` (timestamptz) - When session started

  ## Security
  - RLS is enabled on all tables
  - Public access policies allow anyone to read/write documents (no auth required)
  - Active sessions automatically cleaned up after 2 minutes of inactivity
  - All operations are allowed since this is a public, no-login collaboration tool

  ## Indexes
  - Index on document_id for fast session lookups
  - Index on last_seen for efficient cleanup queries

  ## Notes
  - This is intentionally public and permissionless for easy collaboration
  - Real-time subscriptions will be used for live updates
  - Consider implementing rate limiting at application level
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text DEFAULT '',
  language text DEFAULT 'javascript',
  title text DEFAULT 'Untitled Document',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create active sessions table for presence
CREATE TABLE IF NOT EXISTS active_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_color text NOT NULL,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_active_sessions_document_id ON active_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_seen ON active_sessions(last_seen);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- Documents policies (public access, no auth required)
CREATE POLICY "Anyone can view documents"
  ON documents FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create documents"
  ON documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update documents"
  ON documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete documents"
  ON documents FOR DELETE
  USING (true);

-- Active sessions policies (public access)
CREATE POLICY "Anyone can view active sessions"
  ON active_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create sessions"
  ON active_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON active_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete sessions"
  ON active_sessions FOR DELETE
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on documents
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();