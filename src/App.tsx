/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, ScreenName, Student, Plant, DeleteLog, BadgeDef } from './types';
import { ECO_TIPS, TRANSLATIONS } from './data';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import StudentRegister from './components/StudentRegister';
import StudentLogin from './components/StudentLogin';
import AdminLogin from './components/AdminLogin';
import StudentDashboard from './components/StudentDashboard';
import AdminPanel from './components/AdminPanel';
import PlantSeedModal from './components/PlantSeedModal';
import PlantDetailModal from './components/PlantDetailModal';
import AdminStudentModal from './components/AdminStudentModal';
import { Sparkles, Trophy, BookOpen, UserPlus, LogIn, ShieldAlert } from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

const LOCAL_STORAGE_KEY_LOGGED_IN_ID = 'ecoplanter_logged_in_student_id_v1';

// Initial mockup data so the school coordinator has a populated directory in dev/preview
const INITIAL_STUDENTS: Student[] = [
  {
    studentId: 'WED-2026-8802',
    name: 'Aarav Patel',
    classStr: '4-A',
    password: 'green35',
    xp: 180,
    badges: ['first-plant', 'water-master'],
    createdAt: new Date().toISOString(),
  },
  {
    studentId: 'WED-2026-6204',
    name: 'Priya Sharma',
    classStr: '8-B',
    password: 'flower42',
    xp: 240,
    badges: ['first-plant', 'water-master', 'sun-lover'],
    createdAt: new Date().toISOString(),
  },
  {
    studentId: 'WED-2026-3195',
    name: 'Kabir Singh',
    classStr: '12-MATHS',
    password: 'earth77',
    xp: 80,
    badges: ['first-plant'],
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_PLANTS: Plant[] = [];

export default function App() {
  // Global configurations
  const [lang, setLang] = useState<AppLanguage>('en');
  const [screen, setScreen] = useState<ScreenName>('home');

  // Persistence databases
  const [students, setStudents] = useState<Student[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [deleteLogs, setDeleteLogs] = useState<DeleteLog[]>([]);
  const [customBadges, setCustomBadges] = useState<BadgeDef[]>([]);

  // Current session structures
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // New account confirmation cache
  const [justRegisteredStudent, setJustRegisteredStudent] = useState<Student | null>(null);

  // Modals visibility toggles
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [activeDetailPlant, setActiveDetailPlant] = useState<Plant | null>(null);
  const [activeAdminStudent, setActiveAdminStudent] = useState<Student | null>(null);

  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    icon: '✨',
  });

  // Confetti celebrations counter
  const [celebrating, setCelebrating] = useState(false);

  // Interactive Quiz tips loop indices
  const [tipIndex, setTipIndex] = useState(0);

  // Database connection errors caching
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [failingCollection, setFailingCollection] = useState<string | null>(null);

  // 1. Initial State mount & Firestore cloud synchronization listeners
  useEffect(() => {
    const loggedInId = localStorage.getItem(LOCAL_STORAGE_KEY_LOGGED_IN_ID);
    if (loggedInId) {
      setScreen('student-dash');
    }

    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const studentList: Student[] = [];
        snapshot.forEach((docSnap) => {
          studentList.push(docSnap.data() as Student);
        });

        if (studentList.length === 0) {
          // If Firestore is empty, seed it with INITIAL_STUDENTS so workspace stays hydrated
          INITIAL_STUDENTS.forEach(async (s) => {
            try {
              await setDoc(doc(db, 'students', s.studentId), s);
            } catch (err) {
              console.error('Error seeding default student:', err);
            }
          });
        } else {
          setStudents(studentList);
          const currentId = localStorage.getItem(LOCAL_STORAGE_KEY_LOGGED_IN_ID);
          if (currentId) {
            const match = studentList.find((s) => s.studentId === currentId);
            if (match) {
              setCurrentStudent(match);
            }
          }
        }
      },
      (error) => {
        console.error('Firestore students onSnapshot permission error:', error);
        setPermissionError(error.message);
        setFailingCollection('students');
      }
    );

    const unsubPlants = onSnapshot(
      collection(db, 'plants'),
      (snapshot) => {
        const plantList: Plant[] = [];
        snapshot.forEach((docSnap) => {
          plantList.push(docSnap.data() as Plant);
        });
        setPlants(plantList);
      },
      (error) => {
        console.error('Firestore plants onSnapshot permission error:', error);
        setPermissionError(error.message);
        setFailingCollection('plants');
      }
    );

    const unsubLogs = onSnapshot(
      collection(db, 'deleteLogs'),
      (snapshot) => {
        const logList: DeleteLog[] = [];
        snapshot.forEach((docSnap) => {
          logList.push(docSnap.data() as DeleteLog);
        });
        logList.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
        setDeleteLogs(logList);
      },
      (error) => {
        console.error('Firestore deleteLogs onSnapshot permission error:', error);
        setPermissionError(error.message);
        setFailingCollection('deleteLogs');
      }
    );

    const unsubBadges = onSnapshot(
      collection(db, 'customBadges'),
      (snapshot) => {
        const badgeList: BadgeDef[] = [];
        snapshot.forEach((docSnap) => {
          badgeList.push(docSnap.data() as BadgeDef);
        });
        setCustomBadges(badgeList);
      },
      (error) => {
        console.error('Firestore customBadges onSnapshot permission error:', error);
        setPermissionError(error.message);
        setFailingCollection('customBadges');
      }
    );

    return () => {
      unsubStudents();
      unsubPlants();
      unsubLogs();
      unsubBadges();
    };
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const triggerCelebration = () => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 3000);
  };

  const showToastSuccess = (title: string, message: string, icon = '✨') => {
    setToast({
      visible: true,
      title,
      message,
      icon,
    });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // 2. Auth handlers synced with Firestore
  const handleRegistrationCompleted = async (name: string, classStr: string, pass: string) => {
    const randomId = `WED-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent: Student = {
      studentId: randomId,
      name,
      classStr,
      password: pass,
      xp: 15, // Joining bounty!
      badges: ['first-plant'],
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'students', randomId), newStudent);

      setJustRegisteredStudent(newStudent);
      setCurrentStudent(newStudent);
      localStorage.setItem(LOCAL_STORAGE_KEY_LOGGED_IN_ID, newStudent.studentId);
      setScreen('reg-success');
      triggerCelebration();

      const textSuccess = lang === 'en' ? 'Account Created!' : 'खाता बन गया!';
      const descSuccess = lang === 'en'
        ? `Welcome ${name}! Take note of your credentials.`
        : `स्वागत है ${name}! अपना लॉग इन विवरण याद रखें।`;
      showToastSuccess(textSuccess, descSuccess, '🎉');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `students/${randomId}`);
    }
  };

  const handleLoginSubmit = (studentId: string, pass: string) => {
    const match = students.find(
      (s) => s.studentId.toUpperCase() === studentId.toUpperCase() && s.password === pass
    );

    if (match) {
      setCurrentStudent(match);
      localStorage.setItem(LOCAL_STORAGE_KEY_LOGGED_IN_ID, match.studentId);
      setScreen('student-dash');
      triggerCelebration();

      const textSuccess = lang === 'en' ? 'Login Successful' : 'लॉगइन सफल';
      const descSuccess = lang === 'en'
        ? `Welcome back, ${match.name}! Let's care for your plants.`
        : `स्वागत है, ${match.name}! आइए आपके पौधों की देखभाल करें।`;
      showToastSuccess(textSuccess, descSuccess, '🌸');
    } else {
      const textAlert = lang === 'en' ? 'Access Denied' : 'प्रवेश अस्वीकृत';
      const descAlert = lang === 'en'
        ? 'Incorrect Student ID or Password. Try again!'
        : 'गलत स्टूडेंट आईडी या पासवर्ड। फिर से प्रयास करें!';
      showToastSuccess(textAlert, descAlert, '⚠️');
    }
  };

  const handleAdminVerify = (pass: string) => {
    if (pass === 'admin2026') {
      setIsAdminMode(true);
      setScreen('admin-panel');
      triggerCelebration();

      const textSuccess = lang === 'en' ? 'Educator Mode Active' : 'शिक्षक मोड सक्रिय';
      const descSuccess = lang === 'en'
        ? 'Welcome Teacher! You can now monitor gardens and reward stars.'
        : 'स्वागत है शिक्षक! अब आप बगीचों की निगरानी कर सकते हैं और पदक दे सकते हैं।';
      showToastSuccess(textSuccess, descSuccess, '👑');
    } else {
      const textAlert = lang === 'en' ? 'Access Denied' : 'प्रवेश अस्वीकृत';
      const descAlert = lang === 'en' ? 'Wrong passcode!' : 'गलत पासवर्ड!';
      showToastSuccess(textAlert, descAlert, '⚠️');
    }
  };

  const handleStudentLogout = () => {
    setCurrentStudent(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_LOGGED_IN_ID);
    setScreen('home');
    const textOut = lang === 'en' ? 'Logged Out' : 'लॉगआउट हो गया';
    showToastSuccess(textOut, lang === 'en' ? 'Signed out successfully' : 'सफलतापूर्वक लॉगआउट किया गया', '🌿');
  };

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    setScreen('home');
    const textOut = lang === 'en' ? 'Admin Mode Exit' : 'एडमिन मोड समाप्त';
    showToastSuccess(textOut, lang === 'en' ? 'Returned to portal selection' : 'पोर्टल चयन पर वापस आ गए', '🚪');
  };

  // 3. Plant garden action loops synced with Firestore
  const handleAddNewPlantSeed = async (type: string, nickname: string) => {
    if (!currentStudent) return;

    const nowIso = new Date().toISOString();
    const plantId = `plant-custom-${Date.now()}`;
    const newPlant: Plant = {
      id: plantId,
      studentId: currentStudent.studentId,
      plantType: type,
      nickname,
      growth: 10, // Starting seed progress
      waterCount: 0,
      sunCount: 0,
      feedCount: 0,
      createdAt: nowIso,
      lastWateredAt: nowIso,
      lastSunAt: nowIso,
      lastFedAt: nowIso,
    };

    try {
      // Save new plant doc to Firestore
      await setDoc(doc(db, 'plants', plantId), newPlant);

      // Reward points to student
      const updatedStudent: Student = {
        ...currentStudent,
        xp: currentStudent.xp + 15,
      };
      if (!updatedStudent.badges.includes('first-plant')) {
        updatedStudent.badges = [...updatedStudent.badges, 'first-plant'];
      }

      await setDoc(doc(db, 'students', currentStudent.studentId), updatedStudent);

      setIsSeedModalOpen(false);
      triggerCelebration();

      const titleMsg = lang === 'en' ? 'Seed Sown Successfully!' : 'बीज सफलतापूर्वक बोया गया!';
      const descMsg = lang === 'en'
        ? `You planted ${nickname}. Go water it to see it grow!`
        : `आपने ${nickname} को बोया है। इसे विकसित देखने के लिए पानी दें!`;
      showToastSuccess(titleMsg, descMsg, '🌱');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `plants/${plantId}`);
    }
  };

  const handleNurtureActivated = async (action: 'water' | 'sun' | 'feed') => {
    if (!currentStudent || !activeDetailPlant) return;

    // Check if fully grown limits reached
    if (activeDetailPlant.growth >= 100) {
      const textLimit = lang === 'en' ? 'Fully Grown' : 'पूर्ण विकसित';
      showToastSuccess(textLimit, `${activeDetailPlant.nickname} successfully completed all growth milestones!`, '💚');
      return;
    }

    let growthBonus = 8;
    let textActivity = '';

    if (action === 'water') {
      growthBonus = 10;
      textActivity = lang === 'en' ? 'Splattered water over roots! 💧' : 'जड़ों में पानी सींचा! 💧';
    } else if (action === 'sun') {
      growthBonus = 8;
      textActivity = lang === 'en' ? 'Soaked healthy warm sunshine! ☀️' : 'पौधे ने गुनगुनी धूप का आनंद लिया! ☀️';
    } else if (action === 'feed') {
      growthBonus = 15;
      textActivity = lang === 'en' ? 'Added organic compost minerals! 🤎' : 'जैविक खाद के खनिज प्रदान किए! 🤎';
    }

    const newGrowth = Math.min(activeDetailPlant.growth + growthBonus, 100);
    const nowIso = new Date().toISOString();

    const updatedPlant: Plant = {
      ...activeDetailPlant,
      growth: newGrowth,
      waterCount: activeDetailPlant.waterCount + (action === 'water' ? 1 : 0),
      sunCount: activeDetailPlant.sunCount + (action === 'sun' ? 1 : 0),
      feedCount: activeDetailPlant.feedCount + (action === 'feed' ? 1 : 0),
      lastWateredAt: action === 'water' ? nowIso : activeDetailPlant.lastWateredAt,
      lastSunAt: action === 'sun' ? nowIso : activeDetailPlant.lastSunAt,
      lastFedAt: action === 'feed' ? nowIso : activeDetailPlant.lastFedAt,
    };

    const extraBadges = [...currentStudent.badges];
    if (action === 'water' && updatedPlant.waterCount >= 3 && !extraBadges.includes('water-master')) {
      extraBadges.push('water-master');
    }
    if (action === 'sun' && updatedPlant.sunCount >= 3 && !extraBadges.includes('sun-lover')) {
      extraBadges.push('sun-lover');
    }
    if (newGrowth >= 100 && !extraBadges.includes('fully-grown')) {
      extraBadges.push('fully-grown');
      triggerCelebration();
    }

    const updatedStudent: Student = {
      ...currentStudent,
      xp: currentStudent.xp + 10,
      badges: extraBadges,
    };

    try {
      await setDoc(doc(db, 'plants', updatedPlant.id), updatedPlant);
      await setDoc(doc(db, 'students', updatedStudent.studentId), updatedStudent);

      setActiveDetailPlant(updatedPlant);

      const titleCare = lang === 'en' ? 'Care Activity Logged' : 'देखभाल दर्ज की गई';
      showToastSuccess(titleCare, `+10 XP! ${textActivity}`, '✨');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `plants/${updatedPlant.id}`);
    }
  };

  // 4. Coordinator rewards handlers synced with Firestore
  const handleAwardXP = async (points: number) => {
    if (!activeAdminStudent) return;

    const updatedStudent: Student = {
      ...activeAdminStudent,
      xp: activeAdminStudent.xp + points,
    };

    try {
      await setDoc(doc(db, 'students', updatedStudent.studentId), updatedStudent);
      setActiveAdminStudent(updatedStudent);

      const titleAward = lang === 'en' ? 'Green XP Awarded' : 'ग्रीन पॉइंट्स प्रदान किए गए';
      const descAward = lang === 'en'
        ? `Successfully rewarded student ${activeAdminStudent.name} with +${points} XP!`
        : `छात्र ${activeAdminStudent.name} को +${points} XP का पुरस्कार दिया गया!`;
      showToastSuccess(titleAward, descAward, '🎖️');
      triggerCelebration();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${updatedStudent.studentId}`);
    }
  };

  const handleGrantBadge = async (badgeId: string) => {
    if (!activeAdminStudent) return;

    if (activeAdminStudent.badges.includes(badgeId)) {
      showToastSuccess('Warning', 'Student already has this badge!', '⚠️');
      return;
    }

    const updatedStudent: Student = {
      ...activeAdminStudent,
      badges: [...activeAdminStudent.badges, badgeId],
      xp: activeAdminStudent.xp + 50, // Bonus XP for getting a specialized teacher medal
    };

    try {
      await setDoc(doc(db, 'students', updatedStudent.studentId), updatedStudent);
      setActiveAdminStudent(updatedStudent);

      const titleH = lang === 'en' ? 'Badge Conferred!' : 'अतिरिक्त बैज प्रदान किया गया!';
      const descH = lang === 'en'
        ? `Conferred school honor decoration badge to ${activeAdminStudent.name}!`
        : `${activeAdminStudent.name} को स्कूल पदक से विभूषित किया गया!`;
      showToastSuccess(titleH, descH, '🏆');
      triggerCelebration();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${updatedStudent.studentId}`);
    }
  };

  const handleDeletePlant = async (plantId: string) => {
    const plantToDelete = plants.find((p) => p.id === plantId);
    if (!plantToDelete) return;

    const studentOfPlant = students.find((s) => s.studentId === plantToDelete.studentId);
    const logId = `log-${Date.now()}`;
    const newLog: DeleteLog = {
      id: logId,
      studentId: plantToDelete.studentId,
      studentName: studentOfPlant?.name || 'Unknown Student',
      classStr: studentOfPlant?.classStr || 'N/A',
      plantNickname: plantToDelete.nickname,
      plantType: plantToDelete.plantType,
      growthWhenDeleted: plantToDelete.growth,
      deletedAt: new Date().toISOString(),
    };

    try {
      await deleteDoc(doc(db, 'plants', plantId));
      await setDoc(doc(db, 'deleteLogs', logId), newLog);

      if (activeDetailPlant?.id === plantId) {
        setActiveDetailPlant(null);
      }

      const titleDel = lang === 'en' ? 'Plant Removed' : 'पौधा हटाया गया';
      const descDel = lang === 'en' 
        ? `"${plantToDelete.nickname}" has been deleted from your garden. Your teacher can view this in the delete logs.`
        : `आपके बगीचे से "${plantToDelete.nickname}" हटा दिया गया है। आपके शिक्षक इसे हटाए गए लॉग में देख सकते हैं।`;
      showToastSuccess(titleDel, descDel, '🗑️');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `plants/${plantId}`);
    }
  };

  const handleCreateBadge = async (nameEn: string, nameHi: string, descEn: string, descHi: string, emoji: string, color: string) => {
    const badgeId = `badge-custom-${Date.now()}`;
    const newBadge: BadgeDef = {
      id: badgeId,
      en: { name: nameEn, desc: descEn },
      hi: { name: nameHi, desc: descHi },
      emoji,
      color: color || 'bg-teal-100 border-teal-400 text-teal-800',
      isCustom: true,
    };

    try {
      await setDoc(doc(db, 'customBadges', badgeId), newBadge);

      const titleCr = lang === 'en' ? 'Custom Badge Created!' : 'नया बैज बनाया गया!';
      const descCr = lang === 'en' 
        ? `Successfully added "${nameEn}" badge. Teachers can now award this to students!`
        : `बैज "${nameHi}" सफलतापूर्वक बनाया गया। अब आप इसे छात्रों को दे सकते हैं!`;
      showToastSuccess(titleCr, descCr, '🎖️');
      triggerCelebration();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `customBadges/${badgeId}`);
    }
  };

  // Copy registration specifics to system clipboard
  const handleCopyClipboardInfo = () => {
    if (!justRegisteredStudent) return;
    const details = `Student ID: ${justRegisteredStudent.studentId}`;
    
    // Copy fallback for cross-browser support
    const textarea = document.createElement('textarea');
    textarea.value = details;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    const textCopy = lang === 'en' ? 'Credential Saved' : 'विवरण सुरक्षित';
    const textBody = lang === 'en' ? 'Saved to clipboard!' : 'क्लिपबोर्ड में सुरक्षित!';
    showToastSuccess(textCopy, textBody, '📋');
  };

  const trans = TRANSLATIONS[lang];
  const tipsList = ECO_TIPS[lang];

  return (
    <div className="leaf-bg min-h-screen text-slate-800 flex flex-col justify-between transition-all duration-300 font-sans">
      {/* Visual background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-radial from-emerald-100/40 via-sky-50/10 to-transparent"></div>

      {/* Dynamic database permission warning banner */}
      {permissionError && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 relative z-50 shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-amber-900 text-sm md:text-base">
                  {lang === 'en' ? 'Database Connection Restricted' : 'डेटाबेस कनेक्शन सीमित है'}
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed max-w-3xl">
                  {lang === 'en'
                    ? `Your custom Firebase project (plant-68b31) returned "Missing or insufficient permissions" when trying to load "${failingCollection || 'data'}". This happens because Firestore Security Rules are not yet deployed inside your project or Firestore isn't fully enabled there.`
                    : `आपके कस्टम फ़ायरबेस प्रोजेक्ट (plant-68b31) ने "${failingCollection || 'data'}" लोड करते समय अनुमति न होने की त्रुटि दी। ऐसा इसलिए हुआ क्योंकि आपके प्रोजेक्ट में सुरक्षा नियम (Rules) सेट नहीं हैं।`}
                </p>
                <div className="pt-2 text-xs text-amber-800 leading-normal font-mono bg-amber-100/55 p-2 rounded max-h-[100px] overflow-auto select-all">
                  {`// Copy & Paste this rule inside your Firebase Developer Console (Firestore -> Rules tab):\n\nallow read, write: if true;`}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
              <button
                onClick={() => {
                  localStorage.setItem('ecoplanter_use_sandbox', 'true');
                  window.location.reload();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                {lang === 'en' ? 'Switch to Working Sandbox' : 'सैंडबॉक्स का उपयोग करें'}
              </button>
              <button
                onClick={() => setPermissionError(null)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium text-xs px-3 py-2.5 rounded-lg transition-colors text-center cursor-pointer"
              >
                {lang === 'en' ? 'Dismiss' : 'खारिज करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sparkly Confetti Animation Effect */}
      {celebrating && (
        <div className="fixed inset-0 pointer-events-none z-[99] overflow-hidden select-none">
          {Array.from({ length: 100 }).map((_, i) => {
            const colors = ['#10b981', '#3b82f6', '#fbbf24', '#f472b6', '#a78bfa', '#2dd4bf'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            return (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  x: Math.random() * 80 + '%',
                  y: -20,
                  scale: Math.random() * 0.6 + 0.4,
                  rotate: Math.random() * 360,
                }}
                animate={{
                  y: '105vh',
                  x: `calc(${Math.random() * 80}% + ${(Math.random() - 0.5) * 150}px)`,
                  rotate: Math.random() * 720,
                  opacity: [1, 1, 0.4, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 1.5,
                  ease: 'easeOut',
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: randomColor,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Persistent global Header */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        currentStudent={currentStudent}
        isAdminMode={isAdminMode}
        onLogoutStudent={handleStudentLogout}
        onExitAdmin={handleExitAdmin}
        onGoHome={() => {
          if (currentStudent) {
            setScreen('student-dash');
          } else if (isAdminMode) {
            setScreen('admin-panel');
          } else {
            setScreen('home');
          }
        }}
      />

      {/* Dynamic Main Page Content Panels */}
      <main className="max-w-6xl w-full mx-auto p-4 md:p-6 flex-1 flex flex-col justify-center items-center z-10 relative">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.section
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-xl bg-white/90 backdrop-blur-md border-4 border-emerald-400/50 rounded-3xl p-6 md:p-8 shadow-2xl text-center flex flex-col items-center gap-6 relative overflow-hidden select-none"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-100 rounded-full blur-xl opacity-60"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-100 rounded-full blur-xl opacity-60"></div>

              {/* Celebration Environment badge banner */}
              <div className="bg-gradient-to-r from-emerald-400 to-sky-400 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md animate-bounce">
                🌍 June 5 - World Environment Day 🌍
              </div>

              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-1">
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 bg-clip-text text-transparent block">
                    UDAYA PUBLIC SCHOOL
                  </span>
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto my-3"></div>
                <span className="text-7xl md:text-8xl block transform hover:scale-105 duration-300 pointer-events-none select-none my-4">
                  🌳
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-wide leading-none mt-2">
                  {trans.hero_title}
                </h2>
                <p className="text-sm md:text-base text-slate-500 mt-2 font-bold leading-tight max-w-md mx-auto">
                  {trans.hero_sub}
                </p>
              </div>

              {/* Dynamic scroll tips */}
              <div className="bg-emerald-50/75 border border-emerald-100 w-full p-4 rounded-2xl text-xs md:text-sm text-emerald-850 font-bold italic flex items-center justify-center gap-2.5">
                <span className="text-xl shrink-0 select-none">💡</span>
                <span>{tipsList[tipIndex]}</span>
              </div>

              {/* Portal operations */}
              <div className="flex flex-col gap-3.5 w-full mt-2">
                <button
                  onClick={() => setScreen('register')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-6 rounded-2xl text-lg md:text-xl shadow-lg hover:shadow-emerald-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span className="text-2xl">🌱</span>
                  <span>{trans.btn_register}</span>
                </button>

                <button
                  onClick={() => setScreen('login')}
                  className="w-full bg-sky-400 hover:bg-sky-505 text-white font-black py-4 px-6 rounded-2xl text-lg md:text-xl shadow-lg hover:shadow-sky-100/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span className="text-2xl">🔑</span>
                  <span>{trans.btn_login}</span>
                </button>

                <div className="w-full border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => setScreen('admin-login')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold py-3 px-6 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  <span>{trans.btn_admin}</span>
                </button>
              </div>
            </motion.section>
          )}

          {screen === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <StudentRegister
                lang={lang}
                onBack={() => setScreen('home')}
                onRegisterSubmit={handleRegistrationCompleted}
              />
            </motion.div>
          )}

          {screen === 'reg-success' && justRegisteredStudent && (
            <motion.section
              key="reg-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-xl bg-white border-4 border-emerald-400 rounded-3xl p-6 md:p-8 shadow-2xl text-center relative transition-all duration-300"
            >
              <span className="text-6xl block mb-2 select-none" role="img" aria-label="Celebration">
                🎉
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-emerald-700 leading-tight">
                {trans.succ_title}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mt-1 font-bold">
                {trans.succ_sub}
              </p>

              <div className="bg-gradient-to-br from-emerald-50 to-sky-50 border-2 border-emerald-100 rounded-3xl p-5 my-6 text-left flex flex-col gap-4 shadow-inner">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    {trans.succ_lbl_name}
                  </span>
                  <span className="text-lg font-black text-slate-800">
                    {justRegisteredStudent.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-dashed border-emerald-100/60 pt-3.5">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {trans.succ_lbl_class}
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      Class {justRegisteredStudent.classStr}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {trans.succ_lbl_id}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 select-all underline decoration-dashed decoration-emerald-450 decoration-2">
                      {justRegisteredStudent.studentId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setScreen('student-dash')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 px-6 rounded-2xl text-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>{trans.succ_btn_go}</span>
                  <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse animate-spin" />
                </button>

                <button
                  onClick={handleCopyClipboardInfo}
                  className="w-full bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold py-2.5 rounded-xl text-xs transition-all border border-sky-100 cursor-pointer"
                >
                  📥 {trans.succ_btn_copy}
                </button>
              </div>
            </motion.section>
          )}

          {screen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <StudentLogin
                lang={lang}
                onBack={() => setScreen('home')}
                onLoginSubmit={handleLoginSubmit}
              />
            </motion.div>
          )}

          {screen === 'admin-login' && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AdminLogin
                lang={lang}
                onBack={() => setScreen('home')}
                onAdminVerify={handleAdminVerify}
              />
            </motion.div>
          )}

          {screen === 'student-dash' && currentStudent && (
            <motion.div
              key="student-dash"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <StudentDashboard
                currentStudent={currentStudent}
                allStudents={students}
                plants={plants}
                lang={lang}
                customBadges={customBadges}
                onPlantNewSeedClick={() => setIsSeedModalOpen(true)}
                onPlantCardClick={(plant) => setActiveDetailPlant(plant)}
                onRotateTip={() => setTipIndex((prev) => (prev + 1) % tipsList.length)}
                activeTip={tipsList[tipIndex]}
              />
            </motion.div>
          )}

          {screen === 'admin-panel' && isAdminMode && (
            <motion.div
              key="admin-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <AdminPanel
                students={students}
                plants={plants}
                lang={lang}
                deleteLogs={deleteLogs}
                customBadges={customBadges}
                onCreateBadge={handleCreateBadge}
                onManageStudentClick={(student) => setActiveAdminStudent(student)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Modals overlay bindings */}
      <AnimatePresence>
        {isSeedModalOpen && (
          <PlantSeedModal
            lang={lang}
            onClose={() => setIsSeedModalOpen(false)}
            onPlantCompleted={handleAddNewPlantSeed}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeDetailPlant && (
          <PlantDetailModal
            plant={activeDetailPlant}
            lang={lang}
            onClose={() => setActiveDetailPlant(null)}
            onNurture={handleNurtureActivated}
            onDeletePlant={handleDeletePlant}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeAdminStudent && (
          <AdminStudentModal
            student={activeAdminStudent}
            plants={plants}
            lang={lang}
            customBadges={customBadges}
            onClose={() => setActiveAdminStudent(null)}
            onAwardXP={handleAwardXP}
            onGrantBadge={handleGrantBadge}
          />
        )}
      </AnimatePresence>

      {/* Persistence Notification alerts */}
      <Toast
        title={toast.title}
        message={toast.message}
        icon={toast.icon}
        visible={toast.visible}
        onClose={handleCloseToast}
      />

      {/* Persistent global Footer */}
      <Footer lang={lang} />
    </div>
  );
}
