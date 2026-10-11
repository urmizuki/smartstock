// Backtest: last 7 days, every item
// Baseline: order = sales on same day last week (naive)
// SmartStock: newsvendor on prior 4 same weekdays
// Loss per item per day = unmet demand × Cu + unsold units × Co

import { DailySales, Item, ForecastResult } from "./types";
import { forecastItem } from "./forecast";
import { computeNewsvendor } from "./newsvendor";

export function computeDailyLoss(
  demand: number,
  stock: number,
  cu: number,
  co: number
): number {
  const unmet = Math.max(0, demand - stock);
  const unsold = Math.max(0, stock - demand);
  return unmet * cu + unsold * co;
}

export function backtest(
  sales: DailySales[],
  items: Item[],
  days: number = 7
): {
  baselineLoss: number;
  smartStockLoss: number;
  perItem: { itemId: string; baseline: number; smartstock: number }[];
} {
  // Sort by date
  const sortedSales = [...sales].sort((a, b) => a.date.localeCompare(b.date));

  // Get last N days with actual sales
  const uniqueDates = [...new Set(sortedSales.map((s) => s.date))]
    .sort((a, b) => a.localeCompare(b))
    .slice(-days);

  let baselineLoss = 0;
  let smartStockLoss = 0;
  const perItem: { itemId: string; baseline: number; smartstock: number }[] = [];

  for (const item of items) {
    let itemBaseline = 0;
    let itemSmartStock = 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      const date = uniqueDates[i];
      const dow = new Date(date).getDay();
      const weekdayIdx = dow === 0 ? 6 : dow - 1;

      const actual = sortedSales.find(
        (s) => s.date === date && s.itemId === item.id
      );

      // If missing data, use 0 (will be handled by fill)
      const actualDemand = actual ? actual.unitsSold : 0;

      // Baseline: same day last week's sales
      const lastWeekDate = new Date(date);
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeekSales = sortedSales.find(
        (s) => s.date === lastWeekDate.toISOString().slice(0, 10) && s.itemId === item.id
      );
      const baselineOrder = lastWeekSales ? lastWeekSales.unitsSold : 0;
      const baselineStock = item.stock + baselineOrder;

      // SmartStock: forecast on prior 4 same weekdays (excluding today)
      const priorSales = sortedSales.filter(
        (s) => s.date < date && s.itemId === item.id
      );
      const forecast: ForecastResult = forecastItem(priorSales, item, weekdayIdx);
      const nv = computeNewsvendor(item, forecast);
      const smartStock = item.stock + nv.orderQty;

      const cu = item.price - item.cost;
      const co = item.cost;

      itemBaseline += computeDailyLoss(actualDemand, baselineStock, cu, co);
      itemSmartStock += computeDailyLoss(actualDemand, smartStock, cu, co);
    }

    baselineLoss += itemBaseline;
    smartStockLoss += itemSmartStock;
    perItem.push({
      itemId: item.id,
      baseline: Math.round(itemBaseline * 100) / 100,
      smartstock: Math.round(itemSmartStock * 100) / 100,
    });
  }

  return {
    baselineLoss: Math.round(baselineLoss * 100) / 100,
    smartStockLoss: Math.round(smartStockLoss * 100) / 100,
    perItem,
  };
}
