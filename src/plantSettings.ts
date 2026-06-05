/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plant } from './types';

export interface PlantCareRules {
  waterIntervalMs: number;
  sunIntervalMs: number;
  compostIntervalMs: number;
  growthPerWater: number;
  growthPerSun: number;
  growthPerCompost: number;
}

/**
 * Returns the care intervals (in ms) and growth parameters for each plant type.
 * Supports a "Demo Mode" where hours are simulated as seconds for testing and instant gratification.
 */
export function getPlantCareRules(plantType: string, isDemo: boolean): PlantCareRules {
  // Base intervals in hours
  let waterHours = 12;      // base: every 12 hours
  let sunHours = 6;         // base: every 6 hours
  let compostHours = 72;    // base: every 3 days (72 hours)

  let growthWater = 10;
  let growthSun = 8;
  let growthCompost = 15;

  // Custom configurations by plant type/species
  const typeLower = plantType.toLowerCase();
  
  if (typeLower.includes('tomato')) {
    waterHours = 6;
    sunHours = 3;
    compostHours = 24; // 1 day
    growthWater = 15;
    growthSun = 10;
    growthCompost = 25;
  } else if (typeLower.includes('mango') || typeLower.includes('aam') || typeLower.includes('bargad') || typeLower.includes('banyan') || typeLower.includes('teak') || typeLower.includes('sagwan')) {
    waterHours = 18;
    sunHours = 9;
    compostHours = 120; // 5 days
    growthWater = 8;
    growthSun = 6;
    growthCompost = 15;
  } else if (typeLower.includes('rose') || typeLower.includes('gudhal') || typeLower.includes('mogra') || typeLower.includes('genda') || typeLower.includes('hibiscus') || typeLower.includes('marigold') || typeLower.includes('champa') || typeLower.includes('jasmin')) {
    waterHours = 8;
    sunHours = 4;
    compostHours = 48; // 2 days
    growthWater = 12;
    growthSun = 10;
    growthCompost = 20;
  } else if (typeLower.includes('tulsi') || typeLower.includes('aloe') || typeLower.includes('pudina') || typeLower.includes('mint') || typeLower.includes('coriander') || typeLower.includes('dhania') || typeLower.includes('ajwain')) {
    waterHours = 10;
    sunHours = 5;
    compostHours = 48; // 2 days
    growthWater = 12;
    growthSun = 8;
    growthCompost = 18;
  } else if (typeLower.includes('neem') || typeLower.includes('amla') || typeLower.includes('peepal') || typeLower.includes('shami') || typeLower.includes('chandan')) {
    waterHours = 14;
    sunHours = 7;
    compostHours = 72; // 3 days
    growthWater = 10;
    growthSun = 7;
    growthCompost = 15;
  }

  // Convert to milliseconds
  let waterIntervalMs = waterHours * 3600 * 1000;
  let sunIntervalMs = sunHours * 3600 * 1000;
  let compostIntervalMs = compostHours * 3600 * 1000;

  if (isDemo) {
    // In Demo Speed, 1 Hours = 1 Seconds (e.g. 12 Hours = 12 Seconds)
    waterIntervalMs = waterHours * 1000;
    sunIntervalMs = sunHours * 1000;
    compostIntervalMs = compostHours * 1000;
  }

  return {
    waterIntervalMs,
    sunIntervalMs,
    compostIntervalMs,
    growthPerWater: growthWater,
    growthPerSun: growthSun,
    growthPerCompost: growthCompost,
  };
}

/**
 * Calculates remaining cooldown timers in milliseconds for each care action.
 * Returns negative if the action is currently unlocked and due.
 */
export function getRemainingTimeMs(plant: Plant, isDemo: boolean) {
  const rules = getPlantCareRules(plant.plantType, isDemo);
  const now = Date.now();

  const lastWater = new Date(plant.lastWateredAt || plant.createdAt).getTime();
  const lastSun = new Date(plant.lastSunAt || plant.createdAt).getTime();
  const lastFed = new Date(plant.lastFedAt || plant.createdAt).getTime();

  const nextWater = lastWater + rules.waterIntervalMs;
  const nextSun = lastSun + rules.sunIntervalMs;
  const nextFed = lastFed + rules.compostIntervalMs;

  return {
    water: nextWater - now,
    sun: nextSun - now,
    feed: nextFed - now,
  };
}

/**
 * Calculates whether any care requirement has been overdue (neglected).
 * If a requirement has exceeded 1.5x its designated care interval, growth is considered "Stagnant".
 */
export function getNeglectStatus(plant: Plant, isDemo: boolean) {
  const rules = getPlantCareRules(plant.plantType, isDemo);
  const now = Date.now();

  const lastWater = new Date(plant.lastWateredAt || plant.createdAt).getTime();
  const lastSun = new Date(plant.lastSunAt || plant.createdAt).getTime();
  const lastFed = new Date(plant.lastFedAt || plant.createdAt).getTime();

  // If a student doesn't do care within 1.5x the period, it is considered overdue
  const waterOverdue = (now - lastWater) > rules.waterIntervalMs * 1.5;
  const sunOverdue = (now - lastSun) > rules.sunIntervalMs * 1.5;
  const feedOverdue = (now - lastFed) > rules.compostIntervalMs * 1.5;

  return {
    waterOverdue,
    sunOverdue,
    feedOverdue,
    isStagnant: waterOverdue || sunOverdue || feedOverdue,
  };
}
