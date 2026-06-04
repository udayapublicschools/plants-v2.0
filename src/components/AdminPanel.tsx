/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Plant, AppLanguage, DeleteLog, BadgeDef } from '../types';
import { TRANSLATIONS } from '../data';
import { GraduationCap, Search, ShieldAlert, Award, Sparkles, Filter, Trash2, PlusCircle, Check } from 'lucide-react';
import { getPlantStageDetail } from './PlantCard';

interface AdminPanelProps {
  students: Student[];
  plants: Plant[];
  lang: AppLanguage;
  deleteLogs: DeleteLog[];
  customBadges: BadgeDef[];
  onCreateBadge: (nameEn: string, nameHi: string, descEn: string, descHi: string, emoji: string, color: string) => void;
  onManageStudentClick: (student: Student) => void;
}

export default function AdminPanel({
  students,
  plants,
  lang,
  deleteLogs = [],
  customBadges = [],
  onCreateBadge,
  onManageStudentClick,
}: AdminPanelProps) {
  const trans = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<'directory' | 'deletelogs' | 'createbadge'>('directory');

  const [searchVal, setSearchVal] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');

  // New badge creation form states
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descHi, setDescHi] = useState('');
  const [emojiVal, setEmojiVal] = useState('🏅');
  const [colorScheme, setColorScheme] = useState('bg-yellow-50 border-yellow-300 text-yellow-905');

  // Filter students based on search querying and class selection
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchVal.toLowerCase());

    const matchesClass = classFilter === 'ALL' || student.classStr === classFilter;
    return matchesSearch && matchesClass;
  });

  // Unique list of classes currently in roster to display in filters dropdown
  const classesRoster = Array.from(new Set(students.map((s) => s.classStr))).sort();

  // school stats calculations
  const totalStudents = students.length;
  const totalPlants = plants.length;
  const totalActions = plants.reduce(
    (sum, p) => sum + p.waterCount + p.sunCount + p.feedCount,
    0
  );

  // Class Standings Analytics: Accumulate total XP/plants grouped by class
  const classStandings = Array.from(
    students.reduce((map, student) => {
      const cls = student.classStr;
      const current = map.get(cls) || { classStr: cls, xp: 0, plantsCount: 0 };
      current.xp += student.xp;
      map.set(cls, current);
      return map;
    }, new Map<string, { classStr: string; xp: number; plantsCount: number }>())
  )
    .map(([_, val]) => {
      // Add plant count corresponding to students of that class
      const classPlantedCount = plants.filter((p) => {
        const associatedStudent = students.find((s) => s.studentId === p.studentId);
        return associatedStudent?.classStr === val.classStr;
      }).length;

      return {
        ...val,
        plantsCount: classPlantedCount,
      };
    })
    .sort((a, b) => b.xp - a.xp); // Highest XP first

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameHi.trim() || !descEn.trim() || !descHi.trim()) return;

    onCreateBadge(
      nameEn.trim(),
      nameHi.trim(),
      descEn.trim(),
      descHi.trim(),
      emojiVal,
      colorScheme
    );

    // Reset form fields
    setNameEn('');
    setNameHi('');
    setDescEn('');
    setDescHi('');
    setEmojiVal('🏅');
    setActiveTab('directory');
  };

  return (
    <section className="w-full flex flex-col gap-6 transition-all duration-300">
      {/* Welcome Banner metrics */}
      <div className="bg-slate-800 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <span className="bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest font-sans">
            {lang === 'en' ? 'Coordinator Mode' : 'संयोजक मोड'}
          </span>
          <h2 className="text-3xl font-black mt-2 leading-none">
            {trans.admin_dash_title}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1.5 font-medium max-w-sm md:max-w-md">
            {trans.admin_dash_sub}
          </p>
        </div>

        {/* Global Multi-User summaries */}
        <div className="flex flex-wrap gap-4 justify-center select-none shrink-0 font-sans">
          <div className="bg-slate-700/60 border border-slate-600/80 px-4 py-3 rounded-2xl text-center min-w-[100px] shadow-inner">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              {trans.adm_stat_students}
            </span>
            <span className="text-2xl font-black block mt-0.5" id="admin-total-students">
              {totalStudents}
            </span>
          </div>

          <div className="bg-slate-700/60 border border-slate-600/80 px-4 py-3 rounded-2xl text-center min-w-[100px] shadow-inner">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              {trans.adm_stat_plants}
            </span>
            <span className="text-2xl font-black block text-emerald-400 mt-0.5" id="admin-total-plants">
              {totalPlants}
            </span>
          </div>

          <div className="bg-slate-700/60 border border-slate-600/80 px-4 py-3 rounded-2xl text-center min-w-[100px] shadow-inner">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              {trans.adm_stat_actions}
            </span>
            <span className="text-2xl font-black block text-sky-400 mt-0.5" id="admin-total-actions">
              {totalActions}
            </span>
          </div>
        </div>
      </div>

      {/* Main Admin Section Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Directory & educator tool cards (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
          
          {/* Tab switches */}
          <div className="flex border-b border-slate-100 pb-1 gap-2 md:gap-4 overflow-x-auto min-w-full font-sans">
            <button
              onClick={() => setActiveTab('directory')}
              className={`py-2 px-3 md:px-4 font-black text-xs md:text-sm rounded-xl transition-all cursor-pointer border shrink-0 ${
                activeTab === 'directory'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'text-slate-500 hover:text-slate-700 border-transparent hover:bg-slate-50'
              }`}
            >
              🎓 {lang === 'en' ? 'Student Directory' : 'छात्र सूची'}
            </button>
            <button
              onClick={() => setActiveTab('deletelogs')}
              className={`py-2 px-3 md:px-4 font-black text-xs md:text-sm rounded-xl transition-all cursor-pointer border shrink-0 ${
                activeTab === 'deletelogs'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'text-slate-500 hover:text-slate-700 border-transparent hover:bg-slate-50'
              }`}
            >
              🗑️ {lang === 'en' ? 'Delete Logs Audit' : 'हटाए गए पौधों के लॉग'}
            </button>
            <button
              onClick={() => setActiveTab('createbadge')}
              className={`py-2 px-3 md:px-4 font-black text-xs md:text-sm rounded-xl transition-all cursor-pointer border shrink-0 ${
                activeTab === 'createbadge'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'text-slate-500 hover:text-slate-700 border-transparent hover:bg-slate-50'
              }`}
            >
              🏵️ {lang === 'en' ? 'Create Custom Badge' : 'नया पदक बनाएं'}
            </button>
          </div>

          {/* Render Tab Contents */}
          {activeTab === 'directory' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2 select-none">
                  <GraduationCap className="w-5 h-5 text-slate-500" />
                  <span>{trans.adm_dir_title}</span>
                </h3>

                {/* In-Memory Search query input Filters */}
                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto font-sans">
                  <div className="relative flex-1 sm:w-52">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border-2 border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-bold bg-slate-50/50"
                      placeholder={lang === 'en' ? 'Search name / ID...' : 'नाम / आईडी से खोजें...'}
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="pl-3 pr-8 py-2 border-2 border-slate-100 rounded-xl bg-white text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none min-w-[120px]"
                    >
                      <option value="ALL">{trans.filter_all_classes}</option>
                      {classesRoster.map((cls) => (
                        <option key={cls} value={cls}>
                          Class {cls}
                        </option>
                      ))}
                    </select>
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Records roster grids to avoid iframe horizontal scrolls */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px] select-none font-sans">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 bg-slate-50/70">
                      <th className="py-3 px-4 rounded-l-xl">{trans.th_student}</th>
                      <th className="py-3 px-4">{trans.th_class}</th>
                      <th className="py-3 px-4">{trans.th_plants}</th>
                      <th className="py-3 px-4">{trans.th_points}</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">{trans.th_action}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-750 text-xs">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((stud) => {
                        const studentPlants = plants.filter((p) => p.studentId === stud.studentId);
                        const plantLabels = studentPlants
                          .map((p) => {
                            const { emoji } = getPlantStageDetail(p.plantType, p.growth, lang);
                            return `${emoji} ${p.nickname}`;
                          })
                          .join(', ');

                        return (
                          <tr key={stud.studentId} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-3.5 px-4 font-extrabold text-slate-800">
                              <div>{stud.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold font-mono">
                                ID: {stud.studentId}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-550">
                              Class {stud.classStr}
                            </td>
                            <td
                              className="py-3.5 px-4 text-slate-500 max-w-[180px] truncate"
                              title={plantLabels || 'No plants yet'}
                            >
                              <span className="font-semibold text-xs">
                                {plantLabels || (lang === 'en' ? 'No garden' : 'कोई बगीचा नहीं')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                              {stud.xp} XP
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => onManageStudentClick(stud)}
                                className="bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-650 font-black py-1.5 px-3.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                              >
                                🏅 {lang === 'en' ? 'Inspect & Reward' : 'पुरस्कार एवं जांच'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <span className="text-5xl block mb-2 select-none">🤷‍♂️</span>
                          <p className="font-extrabold text-slate-600 text-sm">{trans.adm_no_stud_title}</p>
                          <p className="text-xs">{trans.adm_no_stud_desc}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'deletelogs' && (
            <div className="flex flex-col gap-4 font-sans">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-rose-800 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                  <span>{lang === 'en' ? 'Audit Logs: Student Plant Deletions' : 'ऑडिट लॉग: छात्रों द्वारा हटाए गए पौधे'}</span>
                </h3>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {deleteLogs.length} {lang === 'en' ? 'Records' : 'अभिलेख'}
                </span>
              </div>

              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                {lang === 'en'
                  ? 'This table logs every instance of a student deleting a plant from their profile. It acts as an educator surveillance ledger to ensure intentional botanical activity.'
                  : 'यह तालिका छात्रों द्वारा अपने उद्यान प्रोफाइल से पौधों को हटाने के हर उदाहरण को रिकॉर्ड करती है। यह शिक्षकों को बच्चों के व्यवहार की निगरानी में मदद करता है।'}
              </p>

              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 bg-slate-50/70">
                      <th className="py-3 px-4 rounded-l-xl">{lang === 'en' ? 'Planter Student' : 'संबंधित छात्र'}</th>
                      <th className="py-3 px-4">{lang === 'en' ? 'Plant Species' : 'पौधे की प्रजाति'}</th>
                      <th className="py-3 px-4">{lang === 'en' ? 'Nickname' : 'पौधे का उपनाम'}</th>
                      <th className="py-3 px-4">{lang === 'en' ? 'Growth %' : 'विकास प्रतिशत'}</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">{lang === 'en' ? 'Action Time' : 'हटाने का समय'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                    {deleteLogs.length > 0 ? (
                      deleteLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-black text-slate-800">
                            <div>{log.studentName}</div>
                            <span className="text-[9px] font-bold text-slate-400 block font-mono">
                              ID: {log.studentId} | Class {log.classStr}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-650">
                            {log.plantType}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                            "{log.plantNickname}"
                          </td>
                          <td className="py-3.5 px-4 font-black text-rose-600">
                            {log.growthWhenDeleted}%
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[10px] font-bold">
                            {new Date(log.deletedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <span className="text-5xl block mb-2">🎈</span>
                          <p className="font-extrabold text-slate-600 text-sm">
                            {lang === 'en' ? 'All gardens are pristinely healthy!' : 'सभी बगीचे पूरी तरह स्वस्थ हैं!'}
                          </p>
                          <p className="text-xs">
                            {lang === 'en' ? 'No deletion logs found in the school archives.' : 'स्कूल अभिलेखागार में कोई हटाए गए पौधे का रिकॉर्ड नहीं है।'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'createbadge' && (
            <div className="flex flex-col gap-4 font-sans">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-base font-black text-amber-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500 animate-bounce" />
                  <span>{lang === 'en' ? 'Design and Commission a New Badge' : 'स्कूल सम्मान के लिए नया बैज बनाएं'}</span>
                </h3>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      {lang === 'en' ? 'Badge Title (English)' : 'पदक का शीर्षक (अंग्रेजी में)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Rare Indian Nimbi"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      {lang === 'en' ? 'Badge Title (Hindi)' : 'पदक का शीर्षक (हिंदी में)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={nameHi}
                      onChange={(e) => setNameHi(e.target.value)}
                      placeholder="जैसे: दुर्लभ नीम मित्र"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      {lang === 'en' ? 'Short Citation Description (English)' : 'संक्षिप्त विवरण (अंग्रेजी में)'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={descEn}
                      onChange={(e) => setDescEn(e.target.value)}
                      placeholder="Describe the plant care milestone..."
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-bold"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      {lang === 'en' ? 'Short Citation Description (Hindi)' : 'संक्षिप्त विवरण (हिंदी में)'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={descHi}
                      onChange={(e) => setDescHi(e.target.value)}
                      placeholder="सफलता का विवरण लिखिए जिसे छात्र देख सकें..."
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-bold"
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      {lang === 'en' ? 'Select Badge Icon Emoji' : 'पदक का आइकन इमोजी चुनें'}
                    </label>
                    <div className="flex gap-2.5 flex-wrap">
                      {['🏵️', '🌸', '🌴', '🌻', '🦁', '🌿', '💧', '🌍', '💎', '👑', '🥇', '🦸'].map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => setEmojiVal(emo)}
                          className={`text-2xl p-2 rounded-xl border-2 hover:-translate-y-0.5 transition-all cursor-pointer ${
                            emojiVal === emo ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50/50'
                          }`}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      {lang === 'en' ? 'Visual Trim Aesthetics' : 'रंग और फिनिश चुनें'}
                    </label>
                    <select
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-bold cursor-pointer"
                    >
                      <option value="bg-emerald-50 border-emerald-300 text-emerald-900">
                        ☘️ {lang === 'en' ? 'Forest Emerald' : 'वन्य हरा'}
                      </option>
                      <option value="bg-yellow-50 border-yellow-300 text-yellow-905">
                        👑 {lang === 'en' ? 'Golden Aura' : 'स्वर्णिम ऊर्जा'}
                      </option>
                      <option value="bg-purple-50 border-purple-300 text-purple-900">
                        🛸 {lang === 'en' ? 'Amethyst Cosmic' : 'ब्रह्मांडीय जामुनी'}
                      </option>
                      <option value="bg-sky-50 border-sky-300 text-sky-900">
                        🌊 {lang === 'en' ? 'Ocean Breeze' : 'सामुद्रिक नीला'}
                      </option>
                      <option value="bg-rose-50 border-rose-300 text-rose-900">
                        🔥 {lang === 'en' ? 'Ruby Sunburst' : 'तामसी लाल'}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm py-3 px-6 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Deploy & Save Badge' : 'बनाएं और सहेजें'}</span>
                  </button>
                </div>
              </form>

              {customBadges.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-3">
                    {lang === 'en' ? 'Deploying Custom Badges Directory' : 'वर्तमान में तैनात नए पदक'}
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {customBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs capitalize font-bold ${badge.color}`}
                      >
                        <span className="text-lg">{badge.emoji}</span>
                        <span>{lang === 'en' ? badge.en.name : badge.hi.name}</span>
                        <span className="text-[9px] bg-white/55 px-1.5 rounded-full uppercase font-black tracking-wide">
                          Custom
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* School Class Performance analytics Standings */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <h4 className="font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-155 pb-2.5">
              <span>📊</span>
              <span>{trans.adm_class_stand}</span>
            </h4>

            <div className="flex flex-col gap-3 font-sans">
              {classStandings.length > 0 ? (
                classStandings.map((stand, idx) => {
                  const medal = idx === 0 ? '🏆' : idx === 1 ? '🌟' : idx === 2 ? '✨' : '⭐';

                  return (
                    <div
                      key={stand.classStr}
                      className="flex items-center justify-between text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0 font-bold"
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-700">
                        <span className="shrink-0">{medal}</span>
                        <span className="text-slate-400">#{idx + 1}</span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg ml-1 font-black">
                          Class {stand.classStr}
                        </span>
                      </div>
                      <div className="text-right font-black text-slate-500">
                        <span className="text-emerald-600 font-black">{stand.xp} XP</span>
                        <span className="text-slate-300 font-medium mx-1">|</span>
                        <span>
                          {stand.plantsCount} 🌳
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No group data registered
                </p>
              )}
            </div>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex flex-col gap-3 select-none">
            <h4 className="font-extrabold text-emerald-800 text-sm flex items-center gap-1.5">
              💡 <span>{trans.teacher_tip_title}</span>
            </h4>
            <p className="text-xs text-emerald-950/80 leading-relaxed font-semibold">
              {trans.teacher_tip_body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
