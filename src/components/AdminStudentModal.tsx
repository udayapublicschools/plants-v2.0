/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Student, Plant, AppLanguage, BadgeDef } from '../types';
import { X, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { getPlantStageDetail } from './PlantCard';

interface AdminStudentModalProps {
  student: Student | null;
  plants: Plant[];
  lang: AppLanguage;
  customBadges?: BadgeDef[];
  onClose: () => void;
  onAwardXP: (points: number) => void;
  onGrantBadge: (badgeId: string) => void;
}

export default function AdminStudentModal({
  student,
  plants,
  lang,
  customBadges = [],
  onClose,
  onAwardXP,
  onGrantBadge,
}: AdminStudentModalProps) {
  const trans = TRANSLATIONS[lang];

  if (!student) return null;

  // Filter student's plants list
  const studentPlants = plants.filter((p) => p.studentId === student.studentId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative transition-all duration-300 border-4 border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg cursor-pointer transition-all p-1.5 hover:bg-slate-50 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5 mt-2">
          <span className="text-5xl block select-none" role="img" aria-label="Graduate">
            👨‍🎓
          </span>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{student.name}</h3>
          <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-bold inline-block mt-0.5 select-none">
            {trans.lbl_reg_class} {student.classStr}
          </span>
        </div>

        {/* Award XP & badging control center */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
          <h4 className="font-extrabold text-sm text-slate-700 flex items-center gap-1.5 border-b border-slate-150 pb-2">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span>{trans.adm_action_title}</span>
          </h4>

          {/* Points buttons */}
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              {trans.adm_lbl_points}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onAwardXP(20)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2 px-3 rounded-xl text-xs transition-colors shadow-sm active:scale-95 cursor-pointer"
              >
                +20 XP
              </button>
              <button
                onClick={() => onAwardXP(50)}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-black py-2 px-3 rounded-xl text-xs transition-colors shadow-sm active:scale-95 cursor-pointer"
              >
                +50 XP
              </button>
              <button
                onClick={() => onAwardXP(100)}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-black py-2 px-3 rounded-xl text-xs transition-colors shadow-sm active:scale-95 cursor-pointer"
              >
                +100 XP
              </button>
            </div>
          </div>

          {/* Badge granting selection */}
          <div className="border-t border-slate-200 pt-3 font-sans">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              {trans.adm_lbl_badge}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onGrantBadge('principal-star')}
                disabled={student.badges.includes('principal-star')}
                className={`font-black py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border ${
                  student.badges.includes('principal-star')
                    ? 'bg-slate-100 border-slate-200 text-slate-450 cursor-not-allowed opacity-65'
                    : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
                }`}
              >
                <span>🎖️</span>
                <span className="truncate">{trans.badge_star_name}</span>
              </button>

              <button
                onClick={() => onGrantBadge('green-hero')}
                disabled={student.badges.includes('green-hero')}
                className={`font-black py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border ${
                  student.badges.includes('green-hero')
                    ? 'bg-slate-100 border-slate-200 text-slate-450 cursor-not-allowed opacity-65'
                    : 'bg-sky-100 hover:bg-sky-200 border-sky-300 text-sky-900'
                }`}
              >
                <span>🌍</span>
                <span className="truncate">{trans.badge_hero_name}</span>
              </button>
            </div>

            {/* Render Custom Badges selection if any exist */}
            {customBadges && customBadges.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Award Created Custom Badges' : 'निर्मित कस्टम पदक प्रदान करें'}
                </label>
                <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                  {customBadges.map((badge) => {
                    const hasBadge = student.badges.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        onClick={() => onGrantBadge(badge.id)}
                        disabled={hasBadge}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                          hasBadge
                            ? 'bg-slate-100 border-slate-205 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-400 text-emerald-950'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-lg shrink-0">{badge.emoji}</span>
                          <span className="truncate text-[11px]">
                            {lang === 'en' ? badge.en.name : badge.hi.name}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase bg-white/70 px-1.5 py-0.5 rounded-md text-emerald-800 shrink-0 border border-emerald-100">
                          {hasBadge ? 'Awarded' : '+50 XP'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Underline list of student plants */}
        <div className="mt-5">
          <h4 className="font-extrabold text-slate-500 text-[11px] uppercase tracking-widest mb-2 pb-1 border-b border-slate-100">
            {trans.adm_lbl_plants} ({studentPlants.length})
          </h4>

          <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
            {studentPlants.length > 0 ? (
              studentPlants.map((p) => {
                const { emoji } = getPlantStageDetail(p.plantType, p.growth, lang);
                return (
                  <div
                    key={p.id}
                    className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex justify-between items-center text-xs text-slate-700"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl select-none shrink-0">{emoji}</span>
                      <div className="truncate">
                        <span className="font-black text-slate-800 block truncate">
                          {p.nickname}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">
                          {p.plantType}
                        </span>
                      </div>
                    </div>
                    <div className="font-black text-emerald-600 shrink-0">
                      {p.growth}% grown
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">
                This student has not planted any seeds yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
