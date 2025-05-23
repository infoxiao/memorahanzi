
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { DirectInputTab } from './components/DirectInputTab';
import { ArxivHelperTab } from './components/ArxivHelperTab';
import { ActiveTab } from './types';
import { APP_NAME } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.DIRECT_INPUT);
  
  // Preload voices for SpeechSynthesis API
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
        <Header title={APP_NAME} />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="p-4 sm:p-6 md:p-8">
          {activeTab === ActiveTab.DIRECT_INPUT && <DirectInputTab />}
          {activeTab === ActiveTab.ARXIV_HELPER && <ArxivHelperTab />}
        </main>
        <footer className="text-center p-4 text-sm text-gray-500 border-t border-slate-700">
          <p>&copy; {new Date().getFullYear()} MemoraHanzi. For educational and entertainment purposes only.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
