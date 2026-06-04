/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppLanguage = 'en' | 'hi';

export type ScreenName =
  | 'home'
  | 'register'
  | 'reg-success'
  | 'login'
  | 'admin-login'
  | 'student-dash'
  | 'admin-panel';

export interface Student {
  studentId: string;
  name: string;
  classStr: string; // e.g. "4-A", "11-MATHS"
  password?: string;
  xp: number;
  badges: string[]; // List of badge IDs
  createdAt: string;
}

export interface Plant {
  id: string;
  studentId: string;
  plantType: string;
  nickname: string;
  growth: number; // 0 to 100
  waterCount: number;
  sunCount: number;
  feedCount: number;
  createdAt: string;
  lastWateredAt?: string;
  lastFedAt?: string;
  lastSunAt?: string;
}

export interface BadgeDef {
  id: string;
  en: { name: string; desc: string };
  hi: { name: string; desc: string };
  emoji: string;
  color: string;
  isCustom?: boolean;
}

export interface PresetSeed {
  type: string;
  emoji: string;
  enName: string;
  hiName: string;
  enDesc: string;
  hiDesc: string;
  category?: 'Medicinal' | 'Flowering' | 'Treeline' | 'Veggies/Herbs' | 'Sacred';
}

export interface DeleteLog {
  id: string;
  studentId: string;
  studentName: string;
  classStr: string;
  plantNickname: string;
  plantType: string;
  growthWhenDeleted: number;
  deletedAt: string;
}
