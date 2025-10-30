import { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

interface HeaderProps {
  title: string;
  documentId: string;
  onTitleChange: (title: string) => void;
}

export function Header({ title, documentId, onTitleChange }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const shareUrl = `${window.location.origin}?doc=${documentId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTitleSubmit = () => {
    if (localTitle.trim()) {
      onTitleChange(localTitle.trim());
    } else {
      setLocalTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setLocalTitle(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            {isEditingTitle ? (
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleKeyDown}
                className="bg-gray-700 text-white px-3 py-1 rounded-lg text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors"
              >
                {title}
              </h1>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Share Link
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
