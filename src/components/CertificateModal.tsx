/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Student, AppLanguage } from '../types';
import { X, Award, ShieldCheck, Printer, Calendar } from 'lucide-react';

interface CertificateModalProps {
  student: Student;
  lang: AppLanguage;
  level: number;
  rank: string;
  onClose: () => void;
}

export default function CertificateModal({ student, lang, level, rank, onClose }: CertificateModalProps) {
  const isEn = lang === 'en';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-amber-50/95 border-[10px] border-amber-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative transition-all duration-300 ornament-bg print:absolute print:inset-0 print:border-0 print:shadow-none bg-[radial-gradient(#fef3c7_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Close Button - hidden during print */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-900 hover:text-amber-750 p-1.5 hover:bg-amber-100/50 rounded-full cursor-pointer transition-all print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border Container */}
        <div className="border-4 border-amber-600 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative select-none">
          {/* Gold Ribbons Decor */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white rounded-full p-2.5 shadow-lg border-2 border-amber-600 scale-110">
            <Award className="w-6 h-6 animate-pulse" />
          </div>

          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-800 mt-2">
            {isEn ? 'OFFICIAL WORLD ENVIRONMENT DAY BOARD' : 'विश्व पर्यावरण दिवस समन्वयक बोर्ड'}
          </p>

          <h2 className="text-xl md:text-3xl font-serif text-amber-950 font-black tracking-wide mt-2">
            {isEn ? 'Green Guardian Certificate' : 'हरित पर्यावरण रक्षक सन्मान पत्र'}
          </h2>

          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent my-4"></div>

          <p className="text-xs md:text-sm text-slate-600 font-medium italic">
            {isEn 
              ? 'This official document is proudly presented to student'
              : 'यह आधिकारिक प्रमाण पत्र अत्यंत गर्व के साथ प्रदान किया जाता है'}
          </p>

          {/* Student Name */}
          <h1 className="text-2xl md:text-4xl font-black text-emerald-800 tracking-wider my-4 font-serif underline decoration-amber-600 decoration-wavy py-1">
            {student.name}
          </h1>

          <p className="text-xs md:text-sm text-slate-700 font-extrabold max-w-lg leading-relaxed">
            {isEn 
              ? `of Class [ ${student.classStr} ] for displaying active environmental consciousness on June 5, World Environment Day. By nurturing diverse Indian plants and securing level ${level} (${rank}), this student has rendered outstanding service to botanical studies and biodiversity restoration.`
              : `कक्षा [ ${student.classStr} ] के छात्र ने 5 जून, विश्व पर्यावरण दिवस पर सक्रिय सहभागिता दिखाई। अनेक भारतीय पौधों की देखभाल करके और लेवल ${level} (${rank}) प्राप्त करके, छात्र ने जैव विविधता संवर्धन के क्षेत्र में असाधारण योगदान दिया है।`}
          </p>

          {/* Certificate Badge Display */}
          <div className="my-6 grid grid-cols-4 gap-2.5 max-w-sm">
            <div className="flex flex-col items-center bg-white/75 border border-amber-200/80 px-2 py-1.5 rounded-xl shadow-xs">
              <span className="text-xl">🏆</span>
              <span className="text-[9px] text-amber-950 font-extrabold truncate w-14">
                Level {level}
              </span>
            </div>
            <div className="flex flex-col items-center bg-white/75 border border-amber-200/80 px-2 py-1.5 rounded-xl shadow-xs">
              <span className="text-xl">⭐</span>
              <span className="text-[9px] text-amber-950 font-extrabold truncate w-14">
                {student.xp} XP
              </span>
            </div>
            <div className="flex flex-col items-center bg-white/75 border border-amber-200/80 px-2 py-1.5 rounded-xl shadow-xs">
              <span className="text-xl">🌱</span>
              <span className="text-[9px] text-amber-950 font-extrabold truncate w-14">
                {isEn ? 'Eco Active' : 'सक्रिय'}
              </span>
            </div>
            <div className="flex flex-col items-center bg-white/75 border border-amber-200/80 px-2 py-1.5 rounded-xl shadow-xs">
              <span className="text-xl">🦁</span>
              <span className="text-[9px] text-amber-950 font-extrabold truncate w-14">
                {isEn ? 'Warrior' : 'योद्धा'}
              </span>
            </div>
          </div>

          {/* Lower layout signatures & stamps */}
          <div className="w-full grid grid-cols-2 gap-8 mt-4 pt-6 border-t border-dashed border-amber-300">
            {/* Stamp side */}
            <div className="flex flex-col items-center justify-center relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-600/30 flex items-center justify-center text-emerald-800 font-serif font-black text-[9px] leading-tight select-none transform hover:rotate-12 transition-all p-1.5 text-center">
                WED-2026 APPROVED SEAL
              </div>
              <span className="text-[10px] text-slate-400 font-bold mt-1">
                {isEn ? 'Official Seal' : 'आधिकारिक मुहर'}
              </span>
            </div>

            {/* Signature side */}
            <div className="flex flex-col items-center justify-end">
              <div className="font-serif italic text-emerald-850 font-black border-b border-amber-800 w-32 pb-0.5 text-center text-xs md:text-sm">
                S. S. Ramanujan
              </div>
              <span className="text-[10px] text-slate-500 font-extrabold mt-1 text-center">
                {isEn ? 'Educator / Coordinator' : 'शिक्षक / संयोजक'}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons drawer */}
        <div className="mt-6 flex justify-center gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-amber-800 hover:bg-amber-900 text-white font-extrabold py-2 px-5 rounded-2xl text-xs flex items-center gap-1.5 select-none transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isEn ? 'Print / Export PDF' : 'प्रिंट / पीडीएफ निकालें'}</span>
          </button>
          <button
            onClick={onClose}
            className="bg-amber-200/80 hover:bg-amber-350 text-amber-900 font-extrabold py-2 px-5 rounded-2xl text-xs transition-all cursor-pointer"
          >
            {isEn ? 'Back to Portal' : 'पोर्टल पर वापस'}
          </button>
        </div>
      </div>
    </div>
  );
}
