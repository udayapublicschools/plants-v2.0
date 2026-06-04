/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppLanguage, Student } from '../types';
import { TRANSLATIONS } from '../data';
import { Globe, LogOut, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  lang: AppLanguage;
  onToggleLang: () => void;
  currentStudent: Student | null;
  isAdminMode: boolean;
  onLogoutStudent: () => void;
  onExitAdmin: () => void;
  onGoHome: () => void;
}

export default function Header({
  lang,
  onToggleLang,
  currentStudent,
  isAdminMode,
  onLogoutStudent,
  onExitAdmin,
  onGoHome,
}: HeaderProps) {
  const trans = TRANSLATIONS[lang];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 px-4 py-3 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={onGoHome}>
          <span className="text-3xl">🏫</span>
          <div>
            <h1 className="text-base md:text-xl font-extrabold text-slate-800 tracking-tight uppercase leading-none">
              UDAYA PUBLIC SCHOOL
            </h1>
            <p className="text-[10px] text-emerald-600 font-extrabold tracking-wider uppercase mt-1">
              🌿 {trans.nav_title} • {trans.nav_sub}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-extrabold rounded-full transition-all text-sm shadow-sm active:scale-95 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{trans.lang_btn}</span>
          </button>

          {/* Current Student User pill */}
          {currentStudent && !isAdminMode && (
            <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-sm">
              <span>
                {currentStudent.name} ({currentStudent.classStr})
              </span>
              <button
                onClick={onLogoutStudent}
                className="bg-emerald-700 hover:bg-emerald-800 p-1.5 rounded-full transition-all cursor-pointer ml-1 active:scale-90"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 flex items-center justify-center" />
              </button>
            </div>
          )}

          {/* Admin Coordinator Mode Pill */}
          {isAdminMode && (
            <button
              onClick={onExitAdmin}
              className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-sm flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{trans.admin_logout_text}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
