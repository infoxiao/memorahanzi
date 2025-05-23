
import React, { useState } from 'react';
import { NameDetailsDisplay } from './NameDetailsDisplay';

export const DirectInputTab: React.FC = () => {
  const [nameInput, setNameInput] = useState<string>('');
  const [submittedName, setSubmittedName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedName(nameInput);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-6 bg-slate-700 rounded-lg shadow-xl">
        <label htmlFor="chineseName" className="block text-lg font-medium text-indigo-300 mb-2">
          Enter Chinese Name (Hanzi or Pinyin)
        </label>
        <div className="flex gap-2">
          <input
            id="chineseName"
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g., 张伟 or Zhāng Wěi"
            className="flex-grow p-3 rounded-md bg-slate-600 text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none shadow-inner"
          />
          <button
            type="submit"
            className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md font-semibold transition-colors"
          >
            Process Name
          </button>
        </div>
      </form>

      {submittedName && <NameDetailsDisplay nameToProcess={submittedName} />}
    </div>
  );
};
