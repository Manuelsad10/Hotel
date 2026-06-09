/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PropertyMode } from "../types";

// Reads property mode directly from localStorage to provide helper access
export const getActivePropertyMode = (): PropertyMode | null => {
  try {
    const saved = localStorage.getItem("SAD_HOTEL_PERSISTENT_STATE");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.propertyProfile?.mode || null;
    }
  } catch (e) {
    console.error("Error reading active property mode:", e);
  }
  return null;
};

// Check if a feature is enabled for a given mode
export const isFeatureEnabled = (featureKey: string, mode: PropertyMode | null): boolean => {
  if (!mode) return false;

  // Features mapping per active mode
  const features: Record<string, { GUESTHOUSE: boolean; MIDSIZE_HOTEL: boolean; LARGE_HOTEL: boolean }> = {
    "restaurant": { GUESTHOUSE: false, MIDSIZE_HOTEL: true, LARGE_HOTEL: true },
    "conference": { GUESTHOUSE: false, MIDSIZE_HOTEL: true, LARGE_HOTEL: true },
    "spa_amenities": { GUESTHOUSE: false, MIDSIZE_HOTEL: false, LARGE_HOTEL: true },
    "multiblock": { GUESTHOUSE: false, MIDSIZE_HOTEL: false, LARGE_HOTEL: true },
    "floor_management": { GUESTHOUSE: false, MIDSIZE_HOTEL: true, LARGE_HOTEL: true },
    "channel_manager": { GUESTHOUSE: false, MIDSIZE_HOTEL: true, LARGE_HOTEL: true },
    "basic_housekeeping": { GUESTHOUSE: true, MIDSIZE_HOTEL: true, LARGE_HOTEL: true },
    "reports_basic": { GUESTHOUSE: true, MIDSIZE_HOTEL: true, LARGE_HOTEL: true },
  };

  const check = features[featureKey];
  if (!check) return true; // default enabled
  return check[mode];
};
