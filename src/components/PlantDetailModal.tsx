/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plant, AppLanguage } from '../types';
import { getPlantStageDetail } from './PlantCard';
import { X, Clock, HelpCircle } from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { getRemainingTimeMs, getNeglectStatus } from '../plantSettings';

interface PlantDetailModalProps {
  plant: Plant | null;
  lang: AppLanguage;
  onClose: () => void;
  onNurture: (action: 'water' | 'sun' | 'feed') => void;
  onDeletePlant?: (plantId: string) => void;
}

interface FloatIcon {
  id: number;
  emoji: string;
  left: number;
}

function formatRemainingTime(ms: number, isEn: boolean): string {
  if (ms <= 0) return isEn ? 'READY' : 'तैयार';
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export default function PlantDetailModal({ plant, lang, onClose, onNurture, onDeletePlant }: PlantDetailModalProps) {
  const trans = TRANSLATIONS[lang];
  const [floats, setFloats] = useState<FloatIcon[]>([]);
  const [floatCounter, setFloatCounter] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Read the active "demo mode" setting from localStorage
  const [demoActive, setDemoActive] = useState(() => localStorage.getItem('eco_demo_speed') === 'true');
  const [remaining, setRemaining] = useState(() => plant ? getRemainingTimeMs(plant, demoActive) : { water: 0, sun: 0, feed: 0 });
  const [neglect, setNeglect] = useState(() => plant ? getNeglectStatus(plant, demoActive) : { waterOverdue: false, sunOverdue: false, feedOverdue: false, isStagnant: false });

  // Dynamically update timers every second
  useEffect(() => {
    if (!plant) return;

    const updateTimers = () => {
      const isDemo = localStorage.getItem('eco_demo_speed') === 'true';
      setDemoActive(isDemo);
      setRemaining(getRemainingTimeMs(plant, isDemo));
      setNeglect(getNeglectStatus(plant, isDemo));
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [plant]);

  if (!plant) return null;

  const { emoji, stageName } = getPlantStageDetail(plant.plantType, plant.growth, lang);

  const handleActionClick = (action: 'water' | 'sun' | 'feed') => {
    const isLocked = remaining[action] > 0;

    // Trigger parent nurture callback (the parent will verify & show early message toast if locked)
    onNurture(action);

    if (isLocked) return;

    // Only append floating emoji animation if it actually went through successfully
    const emojiMap = { water: '💧', sun: '☀️', feed: '🤎' };
    const newFloat: FloatIcon = {
      id: floatCounter,
      emoji: emojiMap[action],
      left: Math.random() * 60 + 20, // 20% to 80%
    };

    setFloats((prev) => [...prev, newFloat]);
    setFloatCounter((c) => c + 1);

    // Clean up float after animation completes
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== newFloat.id));
    }, 1200);
  };

  const isWaterLocked = remaining.water > 0;
  const isSunLocked = remaining.sun > 0;
  const isFeedLocked = remaining.feed > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative transition-all duration-300 border-4 border-emerald-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg cursor-pointer transition-all p-1.5 hover:bg-slate-50 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Interactive Plant Stage */}
        <div className="flex flex-col items-center text-center gap-3 relative mt-2">
          {/* Health badge */}
          {neglect.isStagnant ? (
            <span className="bg-rose-100 text-rose-800 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider animate-bounce">
              ⚠️ {lang === 'en' ? 'Stagnant Growth (Needs Care!)' : 'ठहरा हुआ विकास (देखभाल आवश्यक!)'}
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider">
              ✨ {lang === 'en' ? 'Thriving & Healthy' : 'स्वस्थ और लहलहाता हुआ'}
            </span>
          )}

          <div
            id="action-floating-target"
            className="relative w-36 h-36 bg-emerald-50 border-4 border-dashed border-emerald-200 rounded-full flex items-center justify-center select-none overflow-hidden"
          >
            <span className="text-7xl animate-pulse block select-none">{emoji}</span>

            {/* Custom React Floating Indicators */}
            <AnimatePresence>
              {floats.map((f) => (
                <motion.span
                  key={f.id}
                  initial={{ y: 50, x: 0, opacity: 1, scale: 0.8 }}
                  animate={{ y: -80, x: (Math.random() - 0.5) * 30, opacity: 0, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="absolute text-4xl select-none font-sans pointer-events-none"
                  style={{ left: `${f.left}%`, top: '40%' }}
                >
                  {f.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-800">{plant.nickname}</h3>
            <div className="flex items-center gap-1.5 justify-center mt-1">
              <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border border-emerald-200">
                {plant.plantType}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {stageName}
              </span>
            </div>
          </div>

          {/* Cultivation Growth bar */}
          <div className="w-full bg-slate-150 h-7 rounded-sm relative overflow-hidden shadow-inner flex items-center justify-center mt-1">
            <div
              className={`h-full absolute left-0 top-0 transition-all duration-500 ${
                neglect.isStagnant 
                  ? 'bg-gradient-to-r from-amber-400 to-rose-400' 
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500'
              }`}
              style={{ width: `${plant.growth}%` }}
            ></div>
            <span className="font-black text-xs text-slate-800 z-10 select-none drop-shadow-sm">
              {plant.growth}% {lang === 'en' ? 'Grown' : 'विकसित'}
            </span>
          </div>

          {plant.growth >= 100 && (
            <div className="text-center bg-yellow-50 text-yellow-850 p-2.5 border border-yellow-200 rounded-2xl text-xs font-bold w-full animate-pulse">
              🎉 {lang === 'en' ? 'Fully Grown! Awarded Gold Badge!' : 'पूर्ण विकसित! गोल्ड बैज प्रदान किया गया!'}
            </div>
          )}
        </div>

        {/* Nurturing Panel action click tags */}
        <div className="grid grid-cols-3 gap-3 my-5">
          {/* Water Button */}
          <button
            onClick={() => handleActionClick('water')}
            disabled={plant.growth >= 100}
            className={`border-2 p-3 rounded-2xl flex flex-col items-center gap-1 transition-all select-none cursor-pointer relative overflow-hidden ${
              plant.growth >= 100
                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : isWaterLocked
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-205 text-slate-400'
                  : 'bg-sky-50 hover:bg-sky-100 border-sky-250 hover:border-sky-400 text-sky-850 shadow-md hover:-translate-y-1'
            }`}
          >
            {isWaterLocked && (
              <div className="absolute top-1 right-1">
                <Clock className="w-3 h-3 text-slate-400" />
              </div>
            )}
            <span className="text-3xl block">💧</span>
            <span className="font-extrabold text-xs">{trans.act_water}</span>
            
            {isWaterLocked ? (
              <span className="text-[9px] text-slate-500 font-black bg-slate-200/70 px-1.5 py-0.5 rounded-md mt-0.5 tracking-tighter">
                {formatRemainingTime(remaining.water, lang === 'en')}
              </span>
            ) : (
              <span className="text-[10px] text-sky-500 font-bold bg-sky-100/60 px-2 py-0.5 rounded-full mt-0.5">
                READY
              </span>
            )}
            <span className="text-[9px] font-bold text-slate-450 mt-0.5">Total: x{plant.waterCount}</span>
          </button>

          {/* Sun Button */}
          <button
            onClick={() => handleActionClick('sun')}
            disabled={plant.growth >= 100}
            className={`border-2 p-3 rounded-2xl flex flex-col items-center gap-1 transition-all select-none cursor-pointer relative overflow-hidden ${
              plant.growth >= 100
                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : isSunLocked
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-205 text-slate-400'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-250 hover:border-amber-400 text-amber-850 shadow-md hover:-translate-y-1'
            }`}
          >
            {isSunLocked && (
              <div className="absolute top-1 right-1">
                <Clock className="w-3 h-3 text-slate-400" />
              </div>
            )}
            <span className="text-3xl block">☀️</span>
            <span className="font-extrabold text-xs">{trans.act_sun}</span>
            
            {isSunLocked ? (
              <span className="text-[9px] text-slate-500 font-black bg-slate-200/70 px-1.5 py-0.5 rounded-md mt-0.5 tracking-tighter">
                {formatRemainingTime(remaining.sun, lang === 'en')}
              </span>
            ) : (
              <span className="text-[10px] text-amber-550 font-bold bg-amber-100/60 px-2 py-0.5 rounded-full mt-0.5">
                READY
              </span>
            )}
            <span className="text-[9px] font-bold text-slate-450 mt-0.5">Total: x{plant.sunCount}</span>
          </button>

          {/* Compost Button */}
          <button
            onClick={() => handleActionClick('feed')}
            disabled={plant.growth >= 100}
            className={`border-2 p-3 rounded-2xl flex flex-col items-center gap-1 transition-all select-none cursor-pointer relative overflow-hidden ${
              plant.growth >= 100
                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : isFeedLocked
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-205 text-slate-400'
                  : 'bg-orange-50 hover:bg-orange-100 border-orange-250 hover:border-orange-400 text-orange-900 shadow-md hover:-translate-y-1'
            }`}
          >
            {isFeedLocked && (
              <div className="absolute top-1 right-1">
                <Clock className="w-3 h-3 text-slate-400" />
              </div>
            )}
            <span className="text-3xl block">🤎</span>
            <span className="font-extrabold text-xs">{trans.act_feed}</span>
            
            {isFeedLocked ? (
              <span className="text-[9px] text-slate-500 font-black bg-slate-200/70 px-1.5 py-0.5 rounded-md mt-0.5 tracking-tighter">
                {formatRemainingTime(remaining.feed, lang === 'en')}
              </span>
            ) : (
              <span className="text-[10px] text-orange-650 font-bold bg-orange-100/60 px-2 py-0.5 rounded-full mt-0.5">
                READY
              </span>
            )}
            <span className="text-[9px] font-bold text-slate-450 mt-0.5">Total: x{plant.feedCount}</span>
          </button>
        </div>

        {/* Informative Tip */}
        <div className="text-[11px] text-slate-450 bg-slate-50 p-2.5 rounded-xl text-center italic font-semibold border border-slate-100 flex items-center justify-center gap-2">
          <span>🌿</span>
          <span>
            {neglect.isStagnant 
              ? (lang === 'en' ? 'Stagnant plants grow 50% slower! Supply water & sunshine now.' : 'ठहरे हुए पौधे 50% धीमी गति से बढ़ते हैं! जल और धूप प्रदान करें।')
              : trans.act_patience_tip
            }
          </span>
        </div>

        {/* Deletion Section with safety toggle */}
        {onDeletePlant && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-rose-500 hover:text-rose-700 font-extrabold flex items-center gap-1 cursor-pointer py-1.5 px-3.5 hover:bg-rose-50 rounded-xl transition-all font-sans"
              >
                🗑️ {lang === 'en' ? 'Remove Plant from Garden' : 'पौधा अपने उद्यान से हटाएं'}
              </button>
            ) : (
              <div className="text-center w-full bg-rose-50/80 p-3 rounded-2xl border border-rose-100 font-sans">
                <p className="text-xs text-rose-850 font-bold mb-2">
                  {lang === 'en' 
                    ? 'Are you absolutely sure? This will permanently delete your plant, but your teacher can view this in their delete logs.' 
                    : 'क्या आप पूरी तरह सुनिश्चित हैं? यह आपके पौधे को स्थायी रूप से हटा देगा, पर आपके शिक्षक इसे हटाए गए लॉग में देख सकते हैं।'}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      onDeletePlant(plant.id);
                    }}
                    className="bg-rose-650 hover:bg-rose-750 text-white text-xs font-black py-1.5 px-4 rounded-xl cursor-pointer shadow-sm"
                  >
                    {lang === 'en' ? 'Yes, Delete' : 'हाँ, हटाएं'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black py-1.5 px-4 rounded-xl cursor-pointer"
                  >
                    {lang === 'en' ? 'Cancel' : 'रद्द करें'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
