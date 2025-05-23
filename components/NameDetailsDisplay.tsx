
import React, { useState, useEffect, useCallback } from 'react';
import { ProcessedNameDetails } from '../types';
import { getPinyinForName, getKeywordsForName, generateImageForName } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import PronunciationButton from './PronunciationButton';
import { MIN_AUTHOR_NAME_LENGTH } from '../constants';

interface NameDetailsDisplayProps {
  nameToProcess: string;
  isHanziGuessed?: boolean; // To indicate if the input name is potentially Hanzi
}

const isLikelyHanzi = (name: string): boolean => {
  // Basic heuristic: contains non-ASCII characters commonly found in CJK
  // This is a very rough guess and can be improved.
  // eslint-disable-next-line no-control-regex
  return /[^\x00-\x7F]/.test(name);
};


export const NameDetailsDisplay: React.FC<NameDetailsDisplayProps> = ({ nameToProcess }) => {
  const [details, setDetails] = useState<ProcessedNameDetails>({ originalName: nameToProcess });
  const [isLoadingPinyin, setIsLoadingPinyin] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [editableKeywords, setEditableKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState<string>("");

  const resetStateForNewName = useCallback(() => {
    setDetails({ originalName: nameToProcess });
    setEditableKeywords([]);
    setCustomKeyword("");
    setIsLoadingPinyin(false);
    setIsLoadingKeywords(false);
    setIsLoadingImage(false);
  }, [nameToProcess]);

  const processName = useCallback(async () => {
    if (!nameToProcess || nameToProcess.trim().length < MIN_AUTHOR_NAME_LENGTH) {
      setDetails({ originalName: nameToProcess, error: "Name is too short to process." });
      return;
    }
    
    resetStateForNewName();
    let currentPinyin = "";
    const guessedHanzi = isLikelyHanzi(nameToProcess);

    try {
      if (guessedHanzi) {
        setIsLoadingPinyin(true);
        const pinyinResult = await getPinyinForName(nameToProcess);
        currentPinyin = pinyinResult.pinyin;
        setDetails(prev => ({ ...prev, pinyin: currentPinyin, syllables: currentPinyin?.split(' ') || [] }));
        setIsLoadingPinyin(false);
        if (!currentPinyin) {
           setDetails(prev => ({ ...prev, error: "Could not derive Pinyin. Try entering Pinyin directly."}));
           return; // Stop if Pinyin fails
        }
      } else {
        // Assume input is Pinyin if not guessed as Hanzi
        currentPinyin = nameToProcess;
        setDetails(prev => ({ ...prev, pinyin: currentPinyin, syllables: currentPinyin?.split(' ') || [] }));
      }

      setIsLoadingKeywords(true);
      const keywordsResult = await getKeywordsForName(currentPinyin);
      setDetails(prev => ({ ...prev, keywords: keywordsResult.keywords }));
      setEditableKeywords(keywordsResult.keywords || []);
      setIsLoadingKeywords(false);

    } catch (error) {
      console.error("Error processing name:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDetails(prev => ({ ...prev, error: `Processing Error: ${errorMessage}` }));
      setIsLoadingPinyin(false);
      setIsLoadingKeywords(false);
    }
  }, [nameToProcess, resetStateForNewName]);

  useEffect(() => {
    if (nameToProcess && nameToProcess.trim().length >= MIN_AUTHOR_NAME_LENGTH) {
      processName();
    } else {
      resetStateForNewName(); // Clear details if name is too short or empty
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameToProcess]); // processName and resetStateForNewName are memoized

  const handleRegenerateImage = async () => {
    if (!details.pinyin || editableKeywords.length === 0) {
      setDetails(prev => ({ ...prev, error: "Pinyin and keywords are needed to generate an image." }));
      return;
    }
    setIsLoadingImage(true);
    setDetails(prev => ({ ...prev, imageUrl: undefined, error: undefined })); // Clear previous image and error
    try {
      const imageUrl = await generateImageForName(details.originalName, details.pinyin, editableKeywords);
      setDetails(prev => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error("Error regenerating image:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDetails(prev => ({ ...prev, error: `Image Generation Error: ${errorMessage}` }));
    } finally {
      setIsLoadingImage(false);
    }
  };
  
  const handleAddKeyword = () => {
    if (customKeyword.trim() && !editableKeywords.includes(customKeyword.trim())) {
      setEditableKeywords([...editableKeywords, customKeyword.trim()]);
      setCustomKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setEditableKeywords(editableKeywords.filter(k => k !== keywordToRemove));
  };

  if (!nameToProcess || nameToProcess.trim().length < MIN_AUTHOR_NAME_LENGTH) {
    return <p className="text-center text-gray-400 my-4">Enter a name (at least {MIN_AUTHOR_NAME_LENGTH} characters) to see details.</p>;
  }
  
  const currentSyllables = details.pinyin?.split(' ') || [];

  return (
    <div className="mt-6 p-6 bg-slate-700 rounded-lg shadow-xl">
      <h3 className="text-2xl font-semibold text-blue-300 mb-4">
        Processing: <span className="text-indigo-300">{details.originalName}</span>
      </h3>

      {details.error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{details.error}</p>}

      {/* Pinyin Section */}
      <div className="mb-6">
        <h4 className="text-xl font-medium text-indigo-200 mb-2">Pinyin & Pronunciation</h4>
        {isLoadingPinyin && <LoadingSpinner text="Getting Pinyin..." />}
        {details.pinyin && !isLoadingPinyin && (
          <div className="bg-slate-600 p-4 rounded-md">
            <p className="text-2xl text-yellow-300 tracking-wider mb-3">{details.pinyin}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {currentSyllables.map((syllable, index) => (
                <PronunciationButton key={`${syllable}-${index}`} textToSpeak={syllable} />
              ))}
            </div>
             <PronunciationButton textToSpeak={details.pinyin} label="Pronounce Full Name" className="bg-green-500 hover:bg-green-600"/>
          </div>
        )}
         {!details.pinyin && !isLoadingPinyin && !details.error && <p className="text-gray-400">Enter a name to see Pinyin.</p>}
      </div>

      {/* Keywords Section */}
      {details.pinyin && (
        <div className="mb-6">
          <h4 className="text-xl font-medium text-indigo-200 mb-2">Associative Keywords</h4>
          {isLoadingKeywords && <LoadingSpinner text="Brainstorming Keywords..." />}
          {!isLoadingKeywords && (
            <div className="bg-slate-600 p-4 rounded-md">
              {editableKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {editableKeywords.map((keyword, index) => (
                    <span key={index} className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                      {keyword}
                      <button onClick={() => handleRemoveKeyword(keyword)} className="ml-2 text-purple-200 hover:text-white focus:outline-none">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-center mt-2">
                <input
                  type="text"
                  value={customKeyword}
                  onChange={(e) => setCustomKeyword(e.target.value)}
                  placeholder="Add custom keyword"
                  className="flex-grow p-2 rounded-md bg-slate-500 text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleAddKeyword}
                  className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md shadow-sm"
                >
                  Add
                </button>
              </div>
               {editableKeywords.length === 0 && !isLoadingKeywords && <p className="text-gray-400 mt-2">No keywords yet. AI will suggest some, or add your own!</p>}
            </div>
          )}
        </div>
      )}

      {/* Image Generation Section */}
      {details.pinyin && editableKeywords.length > 0 && (
         <div className="mb-6">
          <h4 className="text-xl font-medium text-indigo-200 mb-2">Memorable Image</h4>
           <button
            onClick={handleRegenerateImage}
            disabled={isLoadingImage || isLoadingKeywords || isLoadingPinyin}
            className="w-full mb-4 p-3 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-lg font-semibold transition-colors disabled:opacity-50"
          >
            {isLoadingImage ? 'Generating Image...' : (details.imageUrl ? 'Regenerate Image' : 'Generate Image')}
          </button>
          {isLoadingImage && <LoadingSpinner text="Creating your visual memory aid..." />}
          {details.imageUrl && !isLoadingImage && (
            <div className="bg-slate-600 p-4 rounded-md aspect-square flex justify-center items-center">
              <img src={details.imageUrl} alt={`Visual association for ${details.originalName}`} className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
            </div>
          )}
          {!details.imageUrl && !isLoadingImage && !details.error && <p className="text-gray-400 text-center">Click "Generate Image" to create a visual.</p>}
        </div>
      )}
       {details.pinyin && editableKeywords.length === 0 && !isLoadingKeywords && !isLoadingImage && (
        <p className="text-amber-400 bg-amber-900/30 p-3 rounded-md text-sm">Add some keywords to enable image generation.</p>
      )}
    </div>
  );
};
