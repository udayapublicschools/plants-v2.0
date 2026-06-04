/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../data';
import { Database, Sparkles } from 'lucide-react';

interface FooterProps {
  lang: AppLanguage;
}

export default function Footer({ lang }: FooterProps) {
  const trans = TRANSLATIONS[lang];
  const useSandbox = localStorage.getItem('ecoplanter_use_sandbox') === 'true';

  const handleToggleDb = () => {
    localStorage.setItem('ecoplanter_use_sandbox', useSandbox ? 'false' : 'true');
    window.location.reload();
  };

  return (
    <footer className="bg-emerald-800 text-white/90 text-center py-6 px-4 text-xs md:text-sm mt-12 transition-all">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h5 className="font-extrabold text-base text-emerald-300">
            {trans.foot_title}
          </h5>
          <p className="text-white/60 text-[11px] md:text-xs mt-1">
            {trans.foot_sub}
          </p>
        </div>

        {/* Database Toggle Widget */}
        <div className="flex flex-col items-center md:items-end gap-1.5 bg-emerald-900/40 p-2.5 rounded-lg border border-emerald-700/60">
          <div className="flex items-center gap-1.5 text-xs">
            <Database className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="text-emerald-200">
              {lang === 'en' ? 'Database Source:' : 'डेटाबेस स्रोत:'}
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${useSandbox ? 'bg-amber-400 text-amber-950 font-bold' : 'bg-sky-400 text-sky-950 font-bold'}`}>
              {useSandbox ? 'Sandbox (Working)' : 'Custom (plant-68b31)'}
            </span>
          </div>
          <button
            onClick={handleToggleDb}
            className="text-[10px] bg-emerald-700/65 hover:bg-emerald-600 text-emerald-100 hover:text-white px-2 py-1 rounded transition-all font-semibold flex items-center gap-1 cursor-pointer border border-emerald-600/30"
          >
            {useSandbox ? (
              <>
                <span>🔄</span>
                <span>{lang === 'en' ? 'Switch to My Custom Project' : 'कस्टम प्रोजेक्ट पर जाएं'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                <span>{lang === 'en' ? 'Switch to Sandbox (Works out of box)' : 'सैंडबॉक्स पर जाएं (फ़िक्स)'}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 font-medium">
          <span className="text-emerald-300 text-lg">🌍</span>
          <span>{trans.foot_copy}</span>
        </div>
      </div>
    </footer>
  );
}
