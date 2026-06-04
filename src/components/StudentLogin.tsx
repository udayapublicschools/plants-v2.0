/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../data';
import { ArrowLeft, LogIn } from 'lucide-react';

interface StudentLoginProps {
  lang: AppLanguage;
  onBack: () => void;
  onLoginSubmit: (studentId: string, pass: string) => void;
}

export default function StudentLogin({ lang, onBack, onLoginSubmit }: StudentLoginProps) {
  const trans = TRANSLATIONS[lang];

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) return;

    onLoginSubmit(studentId.trim(), password.trim());
  };

  return (
    <section className="w-full max-w-md bg-white border-4 border-emerald-400/50 rounded-3xl p-6 md:p-8 shadow-xl relative transition-all duration-300">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 flex items-center gap-1 font-bold text-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> <span>{trans.login_back}</span>
      </button>

      <div className="text-center mt-4 mb-6">
        <span className="text-5xl block" role="img" aria-label="Key">
          🔑
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-700 mt-2">
          {trans.login_title}
        </h3>
        <p className="text-xs md:text-sm text-slate-500">{trans.login_sub}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-slate-700 text-sm font-bold mb-1">
            {trans.lbl_login_id}
          </label>
          <input
            type="text"
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full border-2 border-emerald-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-base font-semibold"
            placeholder="e.g. WED-2026-1025"
          />
        </div>

        <div>
          <label className="block text-slate-700 text-sm font-bold mb-1">
            {trans.lbl_login_pass}
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-emerald-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-base font-semibold"
            placeholder={lang === 'en' ? 'Enter password' : 'पासवर्ड दर्ज करें'}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 px-6 rounded-2xl text-lg shadow-lg mt-2 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-5 h-5 font-black" />
          <span>{trans.btn_login_submit}</span>
        </button>
      </form>
    </section>
  );
}
