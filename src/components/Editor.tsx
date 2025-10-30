import { useEffect, useRef, useState } from 'react';
import { documentService } from '../services/documentService';

interface EditorProps {
  documentId: string;
  content: string;
  onContentChange: (content: string) => void;
}

export function Editor({ documentId, content, onContentChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState(content);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const isRemoteUpdateRef = useRef(false);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    const unsubscribe = documentService.subscribeToDocument(documentId, (doc) => {
      isRemoteUpdateRef.current = true;
      setLocalContent(doc.content);
      onContentChange(doc.content);
    });

    return unsubscribe;
  }, [documentId, onContentChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onContentChange(newContent);

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    if (!isRemoteUpdateRef.current) {
      updateTimeoutRef.current = setTimeout(() => {
        documentService.updateDocument(documentId, newContent);
      }, 500);
    } else {
      isRemoteUpdateRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = localContent.substring(0, start) + '  ' + localContent.substring(end);
      setLocalContent(newContent);
      onContentChange(newContent);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        documentService.updateDocument(documentId, newContent);
      }, 500);
    }
  };

  return (
    <div className="flex-1 relative">
      <textarea
        ref={textareaRef}
        value={localContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full h-full p-6 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
        placeholder="Start typing your code..."
        spellCheck={false}
      />
    </div>
  );
}
