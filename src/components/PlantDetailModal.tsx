/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plant, AppLanguage } from '../types';
import { getPlantStageDetail } from './PlantCard';
import { X } from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

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

export default function PlantDetailModal({ plant, lang, onClose, onNurture, onDeletePlant }: PlantDetailModalProps) {
  const trans = TRANSLATIONS[lang];
  const [floats, setFloats] = useState<FloatIcon[]>([]);
  const [floatCounter, setFloatCounter] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!plant) return null;

  const { emoji, stageName } = getPlantStageDetail(plant.plantType, plant.growth, lang);

  const handleActionClick = (action: 'water' | 'sun' | 'feed') => {
    // Append a float emoji animation
    const emojiMap = { water: '💧', sun: '☀️', feed: '🤎' };
    const newFloat: FloatIcon = {
      id: floatCounter,
      emoji: emojiMap[action],
      left: Math.random() * 60 + 20, // 20% to 80%
    };

    setFloats((prev) => [...prev, newFloat]);
    setFloatCounter((c) => c + 1);

    // Trigger parent nurture state modifier callback
    onNurture(action);

    // Clean up float after animation completes
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== newFloat.id));
    }, 1200);
  };

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
        <div className="flex flex-col items-center text-center gap-4 relative mt-2">
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
            <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-extrabold mt-1 inline-block uppercase tracking-wider">
              {plant.plantType}
            </span>
          </div>

          {/* Cultivation Growth bar */}
          <div className="w-full bg-slate-150 h-7 rounded-full relative overflow-hidden shadow-inner flex items-center justify-center mt-2">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full absolute left-0 top-0 transition-all duration-500"
              style={{ width: `${plant.growth}%` }}
            ></div>
            <span className="font-black text-xs text-slate-800 z-10 select-none">
              {plant.growth}% {lang === 'en' ? 'Grown' : 'विकसित'}
            </span>
          </div>

          {plant.growth >= 100 && (
            <div className="text-center bg-yellow-50 text-yellow-800 p-2.5 border border-yellow-200 rounded-2xl text-xs font-bold w-full animate-pulse">
              🎉 {lang === 'en' ? 'Fully Grown! Awarded Gold Badge!' : 'पूर्ण विकसित! गोल्ड बैज प्रदान किया गया!'}
            </div>
          )}
        </div>

        {/* Nurturing Panel action click tags */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <button
            onClick={() => handleActionClick('water')}
            disabled={plant.growth >= 100}
            className={`border-2 p-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all select-none hover:-translate-y-1 active:translate-y-0 cursor-pointer ${
              plant.growth >= 100
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : 'bg-sky-50 hover:bg-sky-100 border-sky-200 hover:border-sky-400 text-sky-850'
            }`}
          >
            <span className="text-3xl text-sky-600 block">💧</span>
            <span className="font-extrabold text-xs">{trans.act_water}</span>
            <span className="text-[10px] text-sky-500 font-bold bg-sky-100/60 px-2 py-0.5 rounded-full mt-0.5">
              x{plant.waterCount}
            </span>
          </button>

          <button
            onClick={() => handleActionClick('sun')}
            disabled={plant.growth >= 100}
            className={`border-2 p-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all select-none hover:-translate-y-1 active:translate-y-0 cursor-pointer ${
              plant.growth >= 100
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : 'bg-amber-50 hover:bg-amber-105 border-amber-200 hover:border-amber-400 text-amber-850'
            }`}
          >
            <span className="text-3xl text-amber-500 block">☀️</span>
            <span className="font-extrabold text-xs">{trans.act_sun}</span>
            <span className="text-[10px] text-amber-500 font-bold bg-amber-100/60 px-2 py-0.5 rounded-full mt-0.5">
              x{plant.sunCount}
            </span>
          </button>

          <button
            onClick={() => handleActionClick('feed')}
            disabled={plant.growth >= 100}
            className={`border-2 p-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all select-none hover:-translate-y-1 active:translate-y-0 cursor-pointer ${
              plant.growth >= 100
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : 'bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-400 text-orange-900'
            }`}
          >
            <span className="text-3xl text-orange-700 block">🤎</span>
            <span className="font-extrabold text-xs">{trans.act_feed}</span>
            <span className="text-[10px] text-orange-700 font-bold bg-orange-150/60 px-2 py-0.5 rounded-full mt-0.5">
              x{plant.feedCount}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 text-center italic font-semibold">
          {trans.act_patience_tip}
        </div>

        {/* Deletion Section with safety toggle */}
        {onDeletePlant && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-rose-500 hover:text-rose-700 font-extrabold flex items-center gap-1 cursor-pointer py-1.5 px-3.5 hover:bg-rose-50 rounded-xl transition-all"
              >
                🗑️ {lang === 'en' ? 'Remove Plant from Garden' : 'पौधा अपने उद्यान से हटाएं'}
              </button>
            ) : (
              <div className="text-center w-full bg-rose-50/80 p-3 rounded-2xl border border-rose-100">
                <p className="text-xs text-rose-800 font-bold mb-2">
                  {lang === 'en' 
                    ? 'Are you absolutely sure? This will permanently delete your plant, but your teacher can view this in their delete logs.' 
                    : 'क्या आप पूरी तरह सुनिश्चित हैं? यह आपके पौधे को स्थायी रूप से हटा देगा, पर आपके शिक्षक इसे हटाए गए लॉग में देख सकते हैं।'}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      onDeletePlant(plant.id);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black py-1.5 px-4 rounded-xl cursor-pointer"
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
