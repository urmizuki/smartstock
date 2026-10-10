// Sample data for SmartStock — synthetic, labelled "sample data"
// 6 items, 8 weeks (56 days) of daily sales
// Tomorrow = 2026-10-10

import { Item, DailySales } from "./types";

// Fixed seed for reproducibility
let seed = 42;
function rand(): number {
  // Mulberry32 PRNG
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const TOMORROW_DATE = "2026-10-12";

export const SAMPLE_ITEMS: Item[] = [
  {
    id: "nasi-lemak",
    name: "Nasi lemak",
    category: "main",
    price: 3.0,
    cost: 1.8,
    supplierLimit: 60,
    stock: 44,
    shelfLifeDays: 1,
  },
  {
    id: "teh-tarik",
    name: "Teh tarik",
    category: "drink",
    price: 2.5,
    cost: 0.7,
    supplierLimit: 40,
    stock: 0,
    shelfLifeDays: 2,
  },
  {
    id: "mee-goreng",
    name: "Mee goreng",
    category: "main",
    price: 4.5,
    cost: 2.0,
    supplierLimit: 45,
    stock: 21,
    shelfLifeDays: 1,
  },
  {
    id: "karipap",
    name: "Karipap",
    category: "snack",
    price: 1.0,
    cost: 0.5,
    supplierLimit: 50,
    stock: 0,
    shelfLifeDays: 2,
  },
  {
    id: "sandwich-tuna",
    name: "Sandwich tuna",
    category: "main",
    price: 4.0,
    cost: 2.4,
    supplierLimit: 20,
    stock: 20,
    expiry: {
      date: "2026-10-13", // one day after tomorrow — near expiry
      hour: 18,
      discount: 0.3,
    },
    shelfLifeDays: 2,
  },
  {
    id: "kuih-lapis",
    name: "Kuih lapis",
    category: "snack",
    price: 1.5,
    cost: 0.6,
    supplierLimit: 30,
    stock: 0,
    expiry: {
      date: "2026-10-14", // two days after tomorrow
      hour: 18,
      discount: 0.4,
    },
    shelfLifeDays: 2,
  },
];

// Weekday demand patterns (baseline average units)
const WEEKDAY_BASELINE: Record<string, number[]> = {
  // itemId -> [Mon..Sun] (0=Mon)
  "nasi-lemak": [28, 24, 26, 22, 34, 38, 16],
  "teh-tarik": [38, 33, 36, 29, 50, 56, 24],
  "mee-goreng": [14, 12, 13, 11, 18, 20, 8],
  "karipap": [42, 36, 39, 32, 50, 55, 28],
  "sandwich-tuna": [10, 8, 9, 7, 11, 12, 6],
  "kuih-lapis": [28, 24, 26, 21, 34, 37, 15],
};

// Generate 56 days (8 weeks) of synthetic sales
export const SAMPLE_SALES: DailySales[] = (() => {
  const sales: DailySales[] = [];
  const startDate = new Date("2026-08-17"); // Monday

  for (let day = 0; day < 56; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const dow = date.getDay(); // 0=Sun
    const weekdayIdx = dow === 0 ? 6 : dow - 1; // 0=Mon..6=Sun
    const week = Math.floor(day / 7);

    for (const item of SAMPLE_ITEMS) {
      const baseline = WEEKDAY_BASELINE[item.id][weekdayIdx];
      // Growth trend: demand rises ~13% per week so historical forecasts lag reality
      const trend = 1 + week * 0.13;
      // Add noise: ±25%
      const noise = 1 + (rand() - 0.5) * 0.5;
      let unitsSold = Math.round(baseline * trend * noise);

      // Inject missing data (~5% of days have no sales recorded)
      if (rand() < 0.05) {
        unitsSold = 0; // missing — planner will fill
      }

      // Ensure non-negative
      unitsSold = Math.max(0, unitsSold);

      sales.push({
        date: date.toISOString().slice(0, 10),
        itemId: item.id,
        unitsSold,
      });
    }
  }

  return sales;
})();

// Tomorrow is 2026-10-12 (Monday). DOW index used by forecast: 0=Mon..6=Sun
export const TOMORROW_DOW = 0; // Monday
