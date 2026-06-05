/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plant, AppLanguage } from '../types';
import { PRESET_SEEDS } from '../data';

interface PlantCardProps {
  plant: Plant;
  lang: AppLanguage;
  onClick: () => void;
  key?: any;
}

export function getPlantStageDetail(type: string, growth: number, lang: AppLanguage) {
  let emoji = '🫘';
  let stageName = '';

  const preset = PRESET_SEEDS.find((s) => s.type === type);
  const finalEmoji = preset?.emoji || '🌳';

  if (growth >= 80) {
    emoji = finalEmoji;
    stageName = lang === 'en' ? 'Fully Grown 🌸' : 'पूर्ण विकसित 🌸';
  } else if (growth >= 60) {
    emoji = '🪴';
    stageName = lang === 'en' ? 'Growing Plant 🌿' : 'बढ़ता हुआ पौधा 🌿';
  } else if (growth >= 40) {
    emoji = '🌿';
    stageName = lang === 'en' ? 'Small Plant 🌱' : 'छोटा पौधा 🌱';
  } else if (growth >= 20) {
    emoji = '🌱';
    stageName = lang === 'en' ? 'Sprout ☘️' : 'अंकुर (Sprout) ☘️';
  } else {
    emoji = '🫘';
    stageName = lang === 'en' ? 'Seed 🫘' : 'बीज अवस्था 🫘';
  }

  return { emoji, stageName };
}

export default function PlantCard({ plant, lang, onClick }: PlantCardProps) {
  const { emoji, stageName } = getPlantStageDetail(plant.plantType, plant.growth, lang);

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-emerald-100 hover:border-emerald-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group select-none hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="absolute top-3 right-3 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
        {stageName}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300 block">
          {emoji}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-slate-800 text-lg leading-tight truncate">
            {plant.nickname}
          </h4>
          <p className="text-xs text-slate-400 font-bold">
            {lang === 'en' ? 'Type' : 'प्रकार'}: {lang === 'en' ? plant.plantType : plant.plantType}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
          <span>{lang === 'en' ? 'Growth Progress' : 'विकास प्रगति'}</span>
          <span className="text-emerald-600 font-extrabold">{plant.growth}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full transition-all duration-500"
            style={{ width: `${plant.growth}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-150 text-center text-[10px] font-black">
        <div className="bg-sky-50 rounded-xl py-1.5 text-sky-800 flex items-center justify-center gap-0.5">
          <span>💧</span> <span>x{plant.waterCount}</span>
        </div>
        <div className="bg-amber-50 rounded-xl py-1.5 text-amber-800 flex items-center justify-center gap-0.5">
          <span>☀️</span> <span>x{plant.sunCount}</span>
        </div>
        <div className="bg-orange-50 rounded-xl py-1.5 text-orange-800 flex items-center justify-center gap-0.5">
          <span>🤎</span> <span>x{plant.feedCount}</span>
        </div>
      </div>
    </div>
  );
}
