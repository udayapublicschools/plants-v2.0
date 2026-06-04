/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppLanguage, PresetSeed } from '../types';
import { PRESET_SEEDS, TRANSLATIONS } from '../data';
import { X, Sprout, Search } from 'lucide-react';

interface PlantSeedModalProps {
  lang: AppLanguage;
  onClose: () => void;
  onPlantCompleted: (type: string, nickname: string) => void;
}

export default function PlantSeedModal({ lang, onClose, onPlantCompleted }: PlantSeedModalProps) {
  const trans = TRANSLATIONS[lang];

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🌱');
  const [nickname, setNickname] = useState('');
  
  // Search and Category filters for 50+ list
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const handleSelectType = (type: string, emoji: string) => {
    setSelectedType(type);
    setSelectedEmoji(emoji);

    // Provide pre-filled funny recommendations
    const suggestions: Record<string, string[]> = {
      Sunflower: ['Sunny', 'Sol', 'Yellowy', 'Sunstar', 'Tejas'],
      Tulsi: ['Tulsi Maa', 'Greens', 'HolyLeaf', 'Pran', 'Aaradhya'],
      Rose: ['Rosy', 'Pinky', 'Charming', 'Gulaab', 'Komal'],
      Tomato: ['Tomaty', 'Cherry', 'RedBall', 'Ketchup', 'Lalima'],
      Neem: ['Neemi', 'Bitter-Sweet', 'Aayur', 'Sanjeevani'],
      Banyan: ['VatVriksha', 'Eternal', 'BanyanBro', 'Dada'],
      Peepal: ['Peepu', 'Oxygen-Infinite', 'Bodhi', 'Vasudev'],
      Marigold: ['Genda', 'Sunehra', 'Festive', 'Jyothi'],
      Aloe_Vera: ['Alu', 'Smoother', 'Kanti', 'Ghrithkumari'],
      Mint: ['Pudina', 'Cooler', 'Freshy', 'Minty'],
    };

    // Extract potential base name for backup suggestion
    const key = type.replace(/\s+/g, '_');
    const list = suggestions[key] || suggestions[type] || ['Harit', 'Seedling', 'Suhana', 'Mitra', 'Ankur', 'Sanjeevan'];
    const randomNick = list[Math.floor(Math.random() * list.length)];
    setNickname(randomNick);
  };

  const handlePlant = () => {
    if (!selectedType) return;
    const finalNickname = nickname.trim() || selectedType;
    onPlantCompleted(selectedType, finalNickname);
  };

  // Categories list
  const categories = ['ALL', 'Medicinal', 'Flowering', 'Treeline', 'Veggies/Herbs', 'Sacred'];

  // Filter seeds list
  const filteredSeeds = PRESET_SEEDS.filter((preset) => {
    const matchesSearch =
      preset.enName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.hiName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || preset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative transition-all duration-300 border-4 border-emerald-100 flex flex-col gap-4">
        
        {/* Close trigger button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg cursor-pointer transition-all p-1.5 hover:bg-slate-50 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="text-2xl font-black text-emerald-800 flex items-center justify-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600 animate-pulse" />
            <span>{trans.m_plant_title}</span>
          </h3>
          <p className="text-xs text-slate-450 mt-1 font-semibold">
            {lang === 'en' ? 'Select from almost 50 sacred, flowering, and medicinal Indian saplings!' : 'लगभग 50 पवित्र, पुष्पी और औषधीय भारतीय पौधों में से चुनें!'}
          </p>
        </div>

        {/* Filters and search drawer */}
        <div className="flex flex-col gap-2 font-sans">
          {/* Category Quick Badges */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-emerald-100">
            {categories.map((cat) => {
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-[10px] md:text-xs font-black rounded-full transition-all cursor-pointer border shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? (lang === 'en' ? 'All categories' : 'सभी श्रेणियां') : cat}
                </button>
              );
            })}
          </div>

          {/* Search Input bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search seeds by name...' : 'पौधे खोजें...'}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 50 Preset scrollable list container */}
        <div className="max-h-[200px] overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3 border border-slate-100 rounded-2xl p-2 bg-slate-50/45 scrollbar-thin">
          {filteredSeeds.length > 0 ? (
            filteredSeeds.map((preset) => {
              const isSelected = selectedType === preset.type;
              const cardBg = isSelected
                ? 'border-emerald-500 bg-emerald-50/70 scale-[1.03] shadow-md shadow-emerald-50'
                : 'border-emerald-100/60 bg-white hover:border-emerald-400 hover:bg-emerald-50/10';

              return (
                <button
                  key={preset.type}
                  onClick={() => handleSelectType(preset.type, preset.emoji)}
                  className={`border-2 rounded-2xl p-2.5 flex flex-col items-center gap-1 transition-all text-center select-none cursor-pointer group ${cardBg}`}
                >
                  <span className="text-3xl block group-hover:scale-110 duration-200">
                    {preset.emoji}
                  </span>
                  <span className="font-extrabold text-slate-800 text-xs truncate max-w-full">
                    {lang === 'en' ? preset.enName : preset.hiName}
                  </span>
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 rounded-full font-black">
                    {preset.category || 'Herb'}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs italic font-semibold">
              {lang === 'en' ? 'No Indian plants found matching search...' : 'संबद्ध पौधा नहीं मिला...'}
            </div>
          )}
        </div>

        {/* Specific seed details editor */}
        {selectedType && (
          <div className="flex flex-col gap-2.5 font-sans animate-fade-in">
            <div className="bg-emerald-50/50 p-2.5 border border-emerald-100/50 rounded-2xl text-center text-xs text-emerald-950 font-bold">
              <span className="text-2xl mr-1.5 select-none">{selectedEmoji}</span>
              {lang === 'en' 
                ? `You selected ${selectedType}! Nurture this sapling with elements to grow it to a healthy tree.` 
                : `आपने ${selectedType} चुना है! इसे स्वस्थ पेड़ बनाने के लिए सूर्य और जल प्रदान करें।`}
            </div>

            <div>
              <label className="block text-slate-600 text-[10px] font-black uppercase tracking-wider mb-1.5 text-center">
                {trans.lbl_seed_nick}
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 font-extrabold text-center text-slate-850 shadow-sm"
                placeholder="e.g. Sproutster"
              />
            </div>

            <button
              onClick={handlePlant}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>🌱</span>
              <span>{trans.m_plant_btn}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
