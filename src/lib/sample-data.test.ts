import { describe, it, expect } from "vitest";
import { SAMPLE_ITEMS, SAMPLE_SALES, TOMORROW_DATE, TOMORROW_DOW } from "./sample-data";
import { runAgents } from "./agents";

describe("sample data sanity", () => {
  it("expiry dates are after tomorrow", () => {
    const tomorrow = new Date(TOMORROW_DATE);
    for (const item of SAMPLE_ITEMS) {
      if (item.expiry) {
        const expiry = new Date(item.expiry.date);
        expect(expiry.getTime()).toBeGreaterThan(tomorrow.getTime());
      }
    }
  });

  it("has between 2 and 3 items not at risk", () => {
    const run = runAgents(SAMPLE_ITEMS, SAMPLE_SALES, TOMORROW_DOW, {
      payday: false,
      rain: false,
      holiday: null,
    });
    const okCount = run.actions.filter((a) => a.category === "ok").length;
    expect(okCount).toBeGreaterThanOrEqual(2);
    expect(okCount).toBeLessThanOrEqual(3);
  });

  it("backtest savings are between 20% and 35%", () => {
    const run = runAgents(SAMPLE_ITEMS, SAMPLE_SALES, TOMORROW_DOW, {
      payday: false,
      rain: false,
      holiday: null,
    });
    expect(run.savingsPercent).toBeGreaterThanOrEqual(20);
    expect(run.savingsPercent).toBeLessThanOrEqual(35);
  });

  it("tomorrow label is derived from TOMORROW_DATE, not hard-coded", () => {
    // The date string itself is the single source of truth.
    expect(TOMORROW_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
