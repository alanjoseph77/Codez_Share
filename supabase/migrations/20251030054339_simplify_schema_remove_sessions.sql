/*
  # Simplify Schema - Remove Session Tracking

  ## Changes
  - Drop active_sessions table (not needed for production)
  - Remove language field from documents (single shared format)
  - Keep only essential fields for real-time collaboration

  ## Remaining Structure
  - documents table with: id, content, title, timestamps
  - Public RLS policies for collaboration
*/

-- Drop active_sessions table
DROP TABLE IF EXISTS active_sessions CASCADE;

-- Remove language column from documents
ALTER TABLE documents DROP COLUMN IF EXISTS language;