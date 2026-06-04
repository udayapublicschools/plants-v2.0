/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../data';

interface FooterProps {
  lang: AppLanguage;
}

export default function Footer({ lang }: FooterProps) {
  const trans = TRANSLATIONS[lang];

  return (
    <footer className="bg-emerald-800 text-white/90 text-center py-6 px-4 text-xs md:text-sm mt-12 transition-all">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h5 className="font-extrabold text-base text-emerald-300">
            {trans.foot_title}
          </h5>
          <p className="text-white/60 text-[11px] md:text-xs mt-1">
            {trans.foot_sub}
          </p>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="text-emerald-300 text-lg">🌍</span>
          <span>{trans.foot_copy}</span>
        </div>
      </div>
    </footer>
  );
}
