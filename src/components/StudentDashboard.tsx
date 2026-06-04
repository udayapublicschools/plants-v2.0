/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, Plant, AppLanguage, BadgeDef } from '../types';
import { BADGE_DETAILS, TRANSLATIONS } from '../data';
import PlantCard from './PlantCard';
import { Award, BookOpen, ChevronRight, Sprout, Trophy, GraduationCap, Bell, Clock, Sparkles } from 'lucide-react';
import CertificateModal from './CertificateModal';

interface StudentDashboardProps {
  currentStudent: Student;
  allStudents: Student[];
  plants: Plant[];
  lang: AppLanguage;
  customBadges?: BadgeDef[];
  onPlantNewSeedClick: () => void;
  onPlantCardClick: (plant: Plant) => void;
  onRotateTip: () => void;
  activeTip: string;
}

export function calculateStudentRank(xp: number, lang: AppLanguage) {
  let level = 1;
  let rank = lang === 'en' ? 'Seedling Planter 🌱' : 'नया रोपक 🌱';

  if (xp >= 300) {
    level = 4;
    rank = lang === 'en' ? 'Forest Creator 🌳' : 'वन निर्माता 🌳';
  } else if (xp >= 150) {
    level = 3;
    rank = lang === 'en' ? 'Earth Guardian 🌍' : 'पृथ्वी रक्षक 🌍';
  } else if (xp >= 60) {
    level = 2;
    rank = lang === 'en' ? 'Active Planter 🌿' : 'सक्रिय रोपक 🌿';
  }

  return { level, rank };
}

export default function StudentDashboard({
  currentStudent,
  allStudents,
  plants,
  lang,
  customBadges = [],
  onPlantNewSeedClick,
  onPlantCardClick,
  onRotateTip,
  activeTip,
}: StudentDashboardProps) {
  const trans = TRANSLATIONS[lang];
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // Re-evaluate timers every 4 seconds to trigger reminders throw the website live
  useEffect(() => {
    const timerId = setInterval(() => {
      setTick((t) => t + 1);
    }, 4000);
    return () => clearInterval(timerId);
  }, []);

  // XP ranking system
  const { level, rank } = calculateStudentRank(currentStudent.xp, lang);

  // Filter student's plants list
  const myPlants = plants.filter((p) => p.studentId === currentStudent.studentId);

  // Active warnings logic
  const activeReminders: Array<{
    plantId: string;
    nickname: string;
    type: 'water' | 'feed';
    message: string;
    secondsOverdue: number;
  }> = [];

  myPlants.forEach((plant) => {
    if (plant.growth >= 100) return;

    const now = Date.now();
    // Use saved ISO string, fall back to createdAt, fall back to now
    const lastWater = plant.lastWateredAt ? new Date(plant.lastWateredAt).getTime() : new Date(plant.createdAt).getTime();
    const lastFeed = plant.lastFedAt ? new Date(plant.lastFedAt).getTime() : new Date(plant.createdAt).getTime();

    const waterDiffSec = Math.floor((now - lastWater) / 1000);
    const feedDiffSec = Math.floor((now - lastFeed) / 1000);

    // Thresholds: water = 45s, feed = 90s
    if (waterDiffSec > 45) {
      activeReminders.push({
        plantId: plant.id,
        nickname: plant.nickname,
        type: 'water',
        message: lang === 'en' 
          ? `💧 needs water (Dry roots)` 
          : `💧 पानी चाहिए (सूखी जड़ें)`,
        secondsOverdue: waterDiffSec - 45,
      });
    }

    if (feedDiffSec > 90) {
      activeReminders.push({
        plantId: plant.id,
        nickname: plant.nickname,
        type: 'feed',
        message: lang === 'en' 
          ? `🤎 needs organic compost!` 
          : `🤎 जैविक खाद चाहिए!`,
        secondsOverdue: feedDiffSec - 90,
      });
    }
  });

  // Combine preset badges with custom badges for display
  const allAvailableBadges = [
    ...Object.values(BADGE_DETAILS),
    ...(customBadges || []),
  ];

  // Sort overall leaderboard top 4 students by XP
  const topStudents = [...allStudents]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 4);

  return (
    <section className="w-full flex flex-col gap-6 transition-all duration-300">
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 text-[140px] pointer-events-none select-none">
          🪴
        </div>

        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full uppercase font-black font-sans">
              {trans.lbl_reg_class} {currentStudent.classStr}
            </span>
            <span className="text-xs text-emerald-100 font-bold font-mono">
              ID: {currentStudent.studentId}
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold mt-2 leading-tight">
            {lang === 'en' ? `Welcome, ${currentStudent.name}! 🌟` : `स्वागत है, ${currentStudent.name}! 🌟`}
          </h2>
          <p className="text-emerald-100 text-xs md:text-sm mt-1.5 font-medium max-w-lg mb-3">
            {trans.dash_motto}
          </p>

          {/* Certificate Download Trigger Button */}
          <button
            onClick={() => setIsCertificateOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-amber-955 font-black py-2.5 px-5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:-translate-y-0.5 transition-all cursor-pointer font-sans"
          >
            <GraduationCap className="w-4.5 h-4.5 text-amber-900" />
            <span>{lang === 'en' ? 'Get Eco-Honor Certificate 🎓' : 'अलंकरण सम्मान पत्र प्राप्त करें 🎓'}</span>
          </button>
        </div>

        {/* Level and XP Gamified stats */}
        <div className="flex gap-4 select-none shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/25 px-4 py-3 rounded-2xl text-center flex flex-col justify-center min-w-[90px] shadow-sm">
            <span className="text-[10px] text-emerald-150 font-black uppercase tracking-wider">
              {trans.dash_stat_level}
            </span>
            <span className="text-3xl font-black block mt-0.5">{level}</span>
            <span className="text-[9px] uppercase tracking-wide text-emerald-200 mt-1 font-bold">
              {rank.split(' ')[0]}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/25 px-4 py-3 rounded-2xl text-center flex flex-col justify-center min-w-[90px] shadow-sm">
            <span className="text-[10px] text-emerald-150 font-black uppercase tracking-wider">
              {trans.dash_stat_xp}
            </span>
            <span className="text-3xl font-black block text-yellow-300 mt-0.5">
              {currentStudent.xp}
            </span>
            <span className="text-[9px] uppercase tracking-wide text-emerald-200 mt-1 font-bold">
              +10 XP / Nurture
            </span>
          </div>
        </div>
      </div>

      {/* 🔔 Eco Alerts and Real-Time Care Notifications Center */}
      <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeReminders.length > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${activeReminders.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <h4 className="font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-2">
              <Bell className={`w-5 h-5 ${activeReminders.length > 0 ? 'text-amber-500 animate-bounce' : 'text-emerald-500'}`} />
              <span>{lang === 'en' ? 'Eco-Care Notification Desk 🔔' : 'इको-केयर सूचना केंद्र 🔔'}</span>
            </h4>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 self-start sm:self-center">
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Demo Speed Active' : 'डेमो गति सक्रिय'}</span>
          </span>
        </div>

        {myPlants.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold italic py-1 text-center">
            {lang === 'en' 
              ? 'Plant your first seed to activate live care reminder notifications! 🌱' 
              : 'लाइव अनुस्मारक सक्रिय करने के लिए अपना पहला बीज बोएं! 🌱'}
          </p>
        ) : activeReminders.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            <p className="text-xs text-slate-500 font-semibold mb-1">
              {lang === 'en' 
                ? 'These plants in your school garden are asking for care. Nurture them now to watch them blossom!' 
                : 'आपके स्कूल के इन पौधों को देखभाल की जरूरत है। इन्हें अभी सींचें और बढ़ते हुए देखें!'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeReminders.map((reminder, rIdx) => {
                const associatedPlant = myPlants.find((p) => p.id === reminder.plantId);
                return (
                  <div 
                    key={rIdx} 
                    className="flex justify-between items-center p-3 rounded-2xl bg-amber-50/50 border border-amber-250/60 shadow-inner hover:bg-amber-50 duration-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">
                        {reminder.type === 'water' ? '💧' : '🤎'}
                      </span>
                      <div className="min-w-0">
                        <span className="block font-black text-xs text-slate-800 truncate">
                          {reminder.nickname}
                        </span>
                        <span className="block text-[10px] text-amber-700 font-bold truncate">
                          {reminder.message}
                        </span>
                      </div>
                    </div>
                    {associatedPlant && (
                      <button
                        onClick={() => onPlantCardClick(associatedPlant)}
                        className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-[10px] px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span>{lang === 'en' ? 'Care Now' : 'सींचें'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 text-center flex flex-col md:flex-row items-center justify-center gap-4 py-3">
            <span className="text-3xl select-none animate-bounce">🌸</span>
            <div className="text-center md:text-left">
              <h5 className="font-extrabold text-emerald-800 text-xs md:text-sm">
                {lang === 'en' ? 'All Plants are Perfectly Happy & Satisfied! 🌱' : 'सभी पौधे पूरी तरह से हरे-भरे और प्रसन्न हैं! 🌱'}
              </h5>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                {lang === 'en' 
                  ? 'Your virtual school botanical collection is hydrated and nourished! High-five for taking daily responsibilities!' 
                  : 'आपका स्कूल वनस्पति संग्रह पूरी तरह से सिंचित और पोषित है! दैनिक जिम्मेदारी निभाने के लिए उत्कृष्ट!'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Garden view (Spans 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1.5 pt-1">
            <h3 className="text-2xl font-black text-emerald-800 flex items-center gap-2">
              <span>🪴</span>
              <span>{trans.dash_garden_title}</span>
            </h3>

            <button
              onClick={onPlantNewSeedClick}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2.5 px-4 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <Sprout className="w-4 h-4" />
              <span>{trans.dash_btn_seed}</span>
            </button>
          </div>

          {/* Plant grids */}
          {myPlants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {myPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  lang={lang}
                  onClick={() => onPlantCardClick(plant)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border-4 border-dashed border-emerald-100 text-center flex flex-col items-center justify-center gap-4 my-2">
              <span className="text-7xl block animate-pulse">🌾</span>
              <div>
                <h4 className="font-extrabold text-xl text-emerald-800">
                  {trans.empty_plant_title}
                </h4>
                <p className="text-xs md:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto font-medium">
                  {trans.empty_plant_desc}
                </p>
              </div>
              <button
                onClick={onPlantNewSeedClick}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 px-6 rounded-xl text-sm transition-all shadow-md cursor-pointer active:scale-95"
              >
                🌱 {trans.empty_plant_btn}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar panels (XP stands, did you know cards) */}
        <div className="flex flex-col gap-6">
          {/* Badge milestones */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/50 flex flex-col gap-4">
            <h4 className="font-extrabold text-lg text-emerald-850 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>{trans.dash_badges}</span>
            </h4>

            <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
              {allAvailableBadges.map((bd) => {
                const badgeId = bd.id;
                const hasBadge = currentStudent.badges.includes(badgeId);

                return (
                  <div
                    key={badgeId}
                    title={lang === 'en' ? bd.en.desc : bd.hi.desc}
                    className={`flex flex-col items-center justify-center p-3 border rounded-2xl text-center transition-all shadow-sm group select-none ${
                      hasBadge
                        ? `${bd.color} border-emerald-300 scale-100`
                        : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-35 grayscale'
                    }`}
                  >
                    <span className="text-3xl block group-hover:scale-110 duration-200">
                      {bd.emoji}
                    </span>
                    <span className="text-[10px] font-black mt-2 leading-tight block">
                      {lang === 'en' ? bd.en.name.replace(/🌳|🌱|💧|☀️|🎖️|🌍/g, '') : bd.hi.name.replace(/🌳|🌱|💧|☀️|🎖️|🌍/g, '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips did you know interactive box */}
          <div className="bg-sky-50 rounded-3xl p-6 border-2 border-sky-100 flex flex-col justify-between gap-4 relative overflow-hidden group">
            <div className="absolute top-1 right-2 opacity-5 select-none text-9xl font-black pointer-events-none">
              ?
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sky-800">
                <BookOpen className="w-5 h-5 text-sky-600 animate-pulse" />
                <h4 className="font-extrabold text-md">{trans.fact_title}</h4>
              </div>
              <p className="text-xs text-sky-950 font-bold leading-relaxed">
                {activeTip}
              </p>
            </div>
            <button
              onClick={onRotateTip}
              className="text-[11px] font-extrabold text-sky-600 hover:text-sky-800 flex items-center gap-1 self-end transition-colors cursor-pointer active:translate-x-0.5"
            >
              <span>{trans.fact_btn}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Leaderboard Column list */}
          <div className="bg-emerald-50/55 rounded-3xl p-6 border-2 border-emerald-100 flex flex-col gap-4">
            <h4 className="font-black text-emerald-850 flex items-center gap-1.5 text-md pb-1 border-b border-emerald-100/60">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{trans.leaderboard_title}</span>
            </h4>

            <div className="flex flex-col gap-2.5">
              {topStudents.length > 0 ? (
                topStudents.map((stud, idx) => {
                  const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️';
                  const isS = stud.studentId === currentStudent.studentId;

                  return (
                    <div
                      key={stud.studentId}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isS
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm font-black'
                          : 'bg-white border-slate-100/80 text-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{medal}</span>
                        <div className="truncate">
                          <span className="block truncate font-extrabold max-w-[130px]">
                            {stud.name}
                          </span>
                          <span
                            className={`text-[9px] block ${isS ? 'text-emerald-100' : 'text-slate-400'}`}
                          >
                            Class {stud.classStr}
                          </span>
                        </div>
                      </div>
                      <span className={`shrink-0 font-extrabold ${isS ? 'text-yellow-200' : 'text-emerald-600'}`}>
                        {stud.xp} XP
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-2 text-xs text-slate-400 italic">
                  No active planters yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isCertificateOpen && (
        <CertificateModal
          student={currentStudent}
          lang={lang}
          level={level}
          rank={rank}
          onClose={() => setIsCertificateOpen(false)}
        />
      )}
    </section>
  );
}
