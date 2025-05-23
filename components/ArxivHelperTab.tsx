
import React, { useState, useCallback } from 'react';
import { identifyChineseNames } from '../services/geminiService';
import { Author } from '../types';
import { NameDetailsDisplay } from './NameDetailsDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { DisclaimerBox } from './DisclaimerBox';
import { ARXIV_DISCLAIMER_TEXT, MIN_AUTHOR_NAME_LENGTH } from '../constants';

export const ArxivHelperTab: React.FC = () => {
  const [authorInput, setAuthorInput] = useState<string>('');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthorName, setSelectedAuthorName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeAuthors = useCallback(async () => {
    if (!authorInput.trim()) {
      setError("Please paste a list of authors.");
      setAuthors([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSelectedAuthorName(null); // Reset selected author
    try {
      const parsedInputAuthors = authorInput
        .split(/[,;\n]+/) // Split by comma, semicolon, or newline
        .map(name => name.trim())
        .filter(name => name.length >= MIN_AUTHOR_NAME_LENGTH);

      if(parsedInputAuthors.length === 0) {
        setError(`No valid author names found. Ensure names are at least ${MIN_AUTHOR_NAME_LENGTH} characters long and separated by commas, semicolons, or newlines.`);
        setAuthors([]);
        setIsLoading(false);
        return;
      }
      
      const { identifiedNames } = await identifyChineseNames(parsedInputAuthors.join('\n'));
      
      const uniqueIdentifiedNames = new Set(identifiedNames);

      const authorObjects: Author[] = parsedInputAuthors.map((name, index) => ({
        id: `${name}-${index}`, // Simple unique ID
        name: name,
        isPotentiallyChinese: uniqueIdentifiedNames.has(name),
      }));
      setAuthors(authorObjects);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to analyze authors: ${errorMessage}`);
      setAuthors([]);
    } finally {
      setIsLoading(false);
    }
  }, [authorInput]);

  const handleAuthorClick = (name: string) => {
    setSelectedAuthorName(name);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-700 rounded-lg shadow-xl">
        <label htmlFor="arxivAuthors" className="block text-lg font-medium text-indigo-300 mb-2">
          Paste arXiv Author List
        </label>
        <p className="text-sm text-gray-400 mb-2">Separate names with commas, semicolons, or new lines.</p>
        <textarea
          id="arxivAuthors"
          value={authorInput}
          onChange={(e) => setAuthorInput(e.target.value)}
          placeholder="e.g., Yiming Chen, John Smith, Xiaohua Li"
          rows={5}
          className="w-full p-3 rounded-md bg-slate-600 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none shadow-inner"
        />
        <button
          onClick={handleAnalyzeAuthors}
          disabled={isLoading}
          className="mt-4 w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md font-semibold transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Authors'}
        </button>
      </div>

      <DisclaimerBox text={ARXIV_DISCLAIMER_TEXT} />

      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
      
      {isLoading && authors.length === 0 && <LoadingSpinner text="Identifying potentially Chinese names..." />}

      {authors.length > 0 && !isLoading && (
        <div className="p-6 bg-slate-700 rounded-lg shadow-xl">
          <h3 className="text-xl font-medium text-indigo-300 mb-3">Author List</h3>
          <p className="text-sm text-gray-400 mb-3">Click a name to process it. Highlighted names are AI-identified as potentially Chinese.</p>
          <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {authors.map((author) => (
              <li key={author.id}>
                <button
                  onClick={() => handleAuthorClick(author.name)}
                  className={`w-full text-left p-3 rounded-md transition-colors text-gray-100
                    ${author.isPotentiallyChinese ? 'bg-green-600/30 hover:bg-green-500/50 border-l-4 border-green-400' : 'bg-slate-600 hover:bg-slate-500/80'}
                    ${selectedAuthorName === author.name ? 'ring-2 ring-blue-400' : ''}
                  `}
                >
                  {author.name} {author.isPotentiallyChinese && <span className="text-xs text-green-300 ml-2">(Potential)</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedAuthorName && (
        <NameDetailsDisplay nameToProcess={selectedAuthorName} />
      )}
    </div>
  );
};
