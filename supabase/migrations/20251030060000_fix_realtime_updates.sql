-- Enable REPLICA IDENTITY for real-time updates
ALTER TABLE documents REPLICA IDENTITY FULL;

-- Ensure the publications include the documents table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'documents'
    ) THEN
        -- Add the documents table to the realtime publication
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE documents';
    END IF;
END $$;
