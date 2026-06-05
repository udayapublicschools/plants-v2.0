/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppLanguage, Student } from '../types';
import { TRANSLATIONS } from '../data';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

interface StudentRegisterProps {
  lang: AppLanguage;
  onBack: () => void;
  onRegisterSubmit: (name: string, classStr: string, pass: string) => void;
}

export default function StudentRegister({ lang, onBack, onRegisterSubmit }: StudentRegisterProps) {
  const trans = TRANSLATIONS[lang];

  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('4');
  const [selectedSection, setSelectedSection] = useState('A');
  const [password, setPassword] = useState('');

  // Classes list 2 to 12
  const classesList = Array.from({ length: 11 }, (_, i) => String(i + 2));

  // Initial random password generation on mount
  useEffect(() => {
    const prefixes = ['green', 'tree', 'seed', 'eco', 'earth', 'leaf', 'flower', 'water', 'sun'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setPassword(`${prefix}${num}`);
  }, []);

  const handleGeneratePassword = (e: React.MouseEvent) => {
    e.preventDefault();
    const prefixes = ['green', 'tree', 'seed', 'eco', 'earth', 'leaf', 'flower', 'water', 'sun'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setPassword(`${prefix}${num}`);
  };

  // Determine section stream options based on class chosen
  const isHighSchool = parseInt(selectedClass) >= 11;
  const sectionOptions = isHighSchool
    ? [
        { value: 'MATHS', label: lang === 'en' ? 'Science (MATHS)' : 'विज्ञान (गणित)' },
        { value: 'BIO', label: lang === 'en' ? 'Science (BIO)' : 'विज्ञान (बायो)' },
        { value: 'COM', label: lang === 'en' ? 'Commerce (COM)' : 'वाणिज्य (कॉमर्स)' },
        { value: 'ARTS', label: lang === 'en' ? 'Humanities (ARTS)' : 'कला (आर्ट्स)' },
      ]
    : [
        { value: 'A', label: lang === 'en' ? 'Section A' : 'सेक्शन ए' },
        { value: 'B', label: lang === 'en' ? 'Section B' : 'सेक्शन बी' },
      ];

  // Set default section stream option when class type changes
  useEffect(() => {
    if (isHighSchool) {
      setSelectedSection('MATHS');
    } else {
      setSelectedSection('A');
    }
  }, [selectedClass, isHighSchool]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;

    const classStr = `${selectedClass}-${selectedSection}`;
    onRegisterSubmit(name.trim(), classStr, password.trim());
  };

  return (
    <section className="w-full max-w-xl bg-white border-4 border-emerald-400/50 rounded-3xl p-6 md:p-8 shadow-xl relative transition-all duration-300">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 flex items-center gap-1 font-bold text-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> <span>{trans.reg_back}</span>
      </button>

      <div className="text-center mt-4 mb-6">
        <span className="text-5xl block animate-bounce" role="img" aria-label="Notepad">
          📝
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-700 mt-2">
          {trans.reg_title}
        </h3>
        <p className="text-xs md:text-sm text-slate-500">{trans.reg_sub}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-slate-700 text-sm font-bold mb-1">
            {trans.lbl_reg_name}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-emerald-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-base font-semibold"
            placeholder={lang === 'en' ? 'e.g. Rahul Sharma / Aarav' : 'उदा. राहुल शर्मा / आरव'}
          />
        </div>

        {/* Dynamic Class Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1">
              {trans.lbl_reg_class}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border-2 border-emerald-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-emerald-500 text-base font-semibold cursor-pointer"
            >
              {classesList.map((cls) => (
                <option key={cls} value={cls}>
                  {lang === 'en' ? `Class ${cls}` : `कक्षा ${cls}`}
                </option>
              ))}
            </select>
          </div>

          {/* Section Stream selection */}
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1">
              {trans.lbl_reg_sec}
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full border-2 border-emerald-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-emerald-500 text-base font-semibold cursor-pointer"
            >
              {sectionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Password Selection */}
        <div>
          <label className="block text-slate-700 text-sm font-bold mb-1">
            {trans.lbl_reg_pass}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-emerald-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-base font-semibold"
              placeholder={lang === 'en' ? 'Choose a password' : 'पासवर्ड चुनें'}
            />
            <button
              onClick={handleGeneratePassword}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs px-4 rounded-xl transition-all border border-emerald-100 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              {trans.btn_magic}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-tight font-medium">
            {trans.reg_pass_note}
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 px-6 rounded-2xl text-lg shadow-lg mt-2 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-5 h-5 font-black" />
          <span>{trans.btn_reg_submit}</span>
        </button>
      </form>
    </section>
  );
}
