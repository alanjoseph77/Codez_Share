import { useEffect, useState } from 'react';
import { documentService } from './services/documentService';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import type { Document } from './lib/supabase';

function App() {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDocument();
  }, []);

  useEffect(() => {
    if (!document?.id) return;
    
    const unsubscribe = documentService.subscribeToDocument(document.id, (updatedDoc) => {
      setDocument(updatedDoc);
    });

    return () => {
      unsubscribe();
    };
  }, [document?.id]);


  const initializeDocument = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const docId = urlParams.get('doc');

      if (docId) {
        const existingDoc = await documentService.getDocument(docId);
        if (existingDoc) {
          setDocument(existingDoc);
        } else {
          setError('Document not found');
        }
      } else {
        const newDoc = await documentService.createDocument();
        setDocument(newDoc);
        window.history.replaceState({}, '', `?doc=${newDoc.id}`);
      }
    } catch (err) {
      console.error('Failed to initialize document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!document) return;
    try {
      await documentService.updateDocumentTitle(document.id, newTitle);
      setDocument({ ...document, title: newTitle });
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };


  const handleContentChange = async (newContent: string) => {
    if (!document) return;
    
    // Update local state immediately for better UX
    setDocument({ ...document, content: newContent });
    
    // Update the server in the background
    try {
      await documentService.updateDocument(document.id, newContent);
    } catch (err) {
      console.error('Failed to update document:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error || 'Failed to load document'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header
        title={document.title}
        documentId={document.id}
        onTitleChange={handleTitleChange}
      />
      <Editor
        documentId={document.id}
        content={document.content}
        onContentChange={handleContentChange}
      />
    </div>
  );
}

export default App;
