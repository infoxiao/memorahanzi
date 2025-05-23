
import React from 'react';
import { ActiveTab } from '../types';

interface TabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabStyles = "py-3 px-6 font-medium text-center cursor-pointer transition-all duration-300 ease-in-out focus:outline-none";
  const activeTabStyles = "text-blue-400 border-b-2 border-blue-400 bg-slate-700/50";
  const inactiveTabStyles = "text-gray-400 hover:text-blue-300 hover:bg-slate-700/30";

  return (
    <nav className="flex justify-center border-b border-slate-700 bg-slate-800">
      <button
        className={`${tabStyles} ${activeTab === ActiveTab.DIRECT_INPUT ? activeTabStyles : inactiveTabStyles}`}
        onClick={() => setActiveTab(ActiveTab.DIRECT_INPUT)}
        aria-pressed={activeTab === ActiveTab.DIRECT_INPUT}
      >
        Direct Name Input
      </button>
      <button
        className={`${tabStyles} ${activeTab === ActiveTab.ARXIV_HELPER ? activeTabStyles : inactiveTabStyles}`}
        onClick={() => setActiveTab(ActiveTab.ARXIV_HELPER)}
        aria-pressed={activeTab === ActiveTab.ARXIV_HELPER}
      >
        arXiv Author Helper
      </button>
    </nav>
  );
};
