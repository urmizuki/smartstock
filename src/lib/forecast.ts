// Forecast: same weekday over last 4 weeks, mean mu and std dev
// P10 = mu - 1.28*sd, P90 = mu + 1.28*sd

import { DailySales, ForecastResult, Item } from "./types";

/**
 * Get same-weekday sales for the last N weeks for a specific item.
 * Fills missing days with same-weekday average from available data.
 */
function getSameWeekdaySales(
  sales: DailySales[],
  itemId: string,
  targetDow: number,
  weeks: number = 4
): number[] {
  // Sort sales by date descending
  const itemSales = sales
    .filter((s) => s.itemId === itemId)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group by date to find which dates are same weekday
  const sameWeekdayValues: number[] = [];
  for (const s of itemSales) {
    const dow = new Date(s.date).getDay();
    const weekdayIdx = dow === 0 ? 6 : dow - 1;
    if (weekdayIdx === targetDow && s.unitsSold > 0) {
      sameWeekdayValues.push(s.unitsSold);
    }
  }

  // Take last N weeks
  const recent = sameWeekdayValues.slice(0, weeks);

  // If fewer than 2 data points, fill from overall average
  if (recent.length < 2) {
    const allValues = itemSales.filter((s) => s.unitsSold > 0).map((s) => s.unitsSold);
    if (allValues.length > 0) {
      const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
      while (recent.length < 2) {
        recent.push(Math.round(avg));
      }
    } else {
      recent.push(10, 10); // ultimate fallback
    }
  }

  return recent;
}

export function forecastItem(
  sales: DailySales[],
  item: Item,
  targetDow: number,
  weeks: number = 4
): ForecastResult {
  const values = getSameWeekdaySales(sales, item.id, targetDow, weeks);
  const mu = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sq, v) => sq + (v - mu) ** 2, 0) / values.length;
  const sd = Math.max(1, Math.sqrt(variance));

  return {
    itemId: item.id,
    mu: Math.round(mu * 10) / 10,
    sd: Math.round(sd * 10) / 10,
    p10: Math.max(0, Math.round((mu - 1.28 * sd) * 10) / 10),
    p90: Math.round((mu + 1.28 * sd) * 10) / 10,
  };
}

export function forecastAll(
  sales: DailySales[],
  items: Item[],
  targetDow: number
): ForecastResult[] {
  return items.map((item) => forecastItem(sales, item, targetDow));
}

/**
 * Count missing days in the sales data (days with 0 units for an item
 * that should have sales based on baseline pattern).
 */
export function countMissingDays(sales: DailySales[]): number {
  let count = 0;
  for (const s of sales) {
    if (s.unitsSold === 0) count++;
  }
  return count;
}
