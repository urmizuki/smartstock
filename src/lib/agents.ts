// Agent pipeline: Planner → parallel (Demand, Expiry, Context) → Validator
// Max 2 retries. Visible trace output.

import {
  Item,
  DailySales,
  ForecastResult,
  NewsvendorResult,
  ActionResult,
  AgentRun,
  TraceStep,
  RiskCategory,
} from "./types";
import { forecastAll, countMissingDays } from "./forecast";
import { computeAllNewsvendor } from "./newsvendor";
import { validatePlan } from "./validator";
import { backtest } from "./backtest";

export interface RunContext {
  payday: boolean;
  rain: boolean;
  holiday: string | null;
}

const SUPPLIERS: Record<string, string> = {
  "nasi-lemak": "Makcik Kitchen Sdn Bhd",
  "teh-tarik": "Beverage Supply Co.",
  "mee-goreng": "Makcik Kitchen Sdn Bhd",
  "karipap": "Snack Distributors",
  "sandwich-tuna": "FreshBites Supply",
  "kuih-lapis": "Kuih Express",
};

export function runAgents(
  items: Item[],
  sales: DailySales[],
  targetDow: number,
  context: RunContext
): AgentRun {
  const trace: TraceStep[] = [];
  const ts = () => new Date().toISOString().slice(11, 19);

  trace.push({
    agent: "Planner",
    message: `Goal received: prepare plan for tomorrow. Context: payday=${context.payday}, rain=${context.rain}, holiday=${context.holiday || "none"}`,
    timestamp: ts(),
  });

  // Clean: count missing days
  const missing = countMissingDays(sales);
  if (missing > 0) {
    trace.push({
      agent: "Planner",
      message: `Data cleaning: ${missing} missing sales entries found. Filling with same-weekday average.`,
      timestamp: ts(),
    });
  }

  // Run specialists in parallel (simulated)
  trace.push({
    agent: "Planner",
    message: "Dispatching to 3 specialists: Demand, Expiry/Markdown, Context",
    timestamp: ts(),
  });

  // === Demand Specialist ===
  trace.push({ agent: "Demand Specialist", message: "Forecasting demand for all 6 items using same-weekday averages over last 4 weeks.", timestamp: ts() });
  let forecasts: ForecastResult[] = forecastAll(sales, items, targetDow);

  // Apply context multipliers
  if (context.payday) {
    trace.push({ agent: "Context Specialist", message: "Payday multiplier applied: drinks ×1.10, mains ×1.05", timestamp: ts() });
    forecasts = forecasts.map((f) => {
      const item = items.find((i) => i.id === f.itemId)!;
      if (item.category === "drink") {
        return { ...f, mu: Math.round(f.mu * 1.1 * 10) / 10, p90: Math.round(f.p90 * 1.1 * 10) / 10 };
      }
      if (item.category === "main") {
        return { ...f, mu: Math.round(f.mu * 1.05 * 10) / 10, p90: Math.round(f.p90 * 1.05 * 10) / 10 };
      }
      return f;
    });
  }
  if (context.rain) {
    trace.push({ agent: "Context Specialist", message: "Rain multiplier applied: drinks ×1.08, snacks ×0.94", timestamp: ts() });
    forecasts = forecasts.map((f) => {
      const item = items.find((i) => i.id === f.itemId)!;
      if (item.category === "drink") {
        return { ...f, mu: Math.round(f.mu * 1.08 * 10) / 10, p90: Math.round(f.p90 * 1.08 * 10) / 10 };
      }
      if (item.category === "snack") {
        return { ...f, mu: Math.round(f.mu * 0.94 * 10) / 10, p90: Math.round(f.p90 * 0.94 * 10) / 10 };
      }
      return f;
    });
  }

  const newsvendor: NewsvendorResult[] = computeAllNewsvendor(items, forecasts);
  trace.push({ agent: "Demand Specialist", message: "Newsvendor order quantities computed. Cu, Co, CR per item calculated.", timestamp: ts() });

  // === Expiry/Markdown Specialist ===
  trace.push({ agent: "Expiry Specialist", message: "Checking items for expiry risk.", timestamp: ts() });

  // === Build actions ===
  const actions: ActionResult[] = items.map((item, idx) => {
    const fc = forecasts[idx];
    const nv = newsvendor[idx];
    const cu = item.price - item.cost;

    // Determine risk category
    let category: RiskCategory = "ok";
    let action = "No action needed";
    let rmImpact = 0;
    let markdownPercent = 0;
    let discountedPrice = 0;
    let reason = "";

    if (item.expiry && item.stock > fc.mu) {
      // Expiry waste risk
      category = "expiry";
      const surplus = item.stock - Math.round(fc.mu);
      const sellThrough = 0.4; // 40% of surplus sells at discount
      const recovered = surplus * sellThrough * item.price * (1 - item.expiry.discount);
      rmImpact = Math.round(recovered * 100) / 100;
      markdownPercent = item.expiry.discount;
      discountedPrice = Math.round((item.price * (1 - item.expiry.discount)) * 100) / 100;
      action = `Markdown ${Math.round(item.expiry.discount * 100)}% — expires ${item.expiry.date}${item.expiry.hour ? " " + item.expiry.hour + ":00" : ""}`;
      reason = `${surplus} units surplus. ${Math.round(sellThrough * 100)}% expected to sell at RM${discountedPrice.toFixed(2)} (was RM${item.price.toFixed(2)}). Recovers RM${rmImpact.toFixed(2)}.`;
    } else if (item.stock < fc.p10 || item.stock < Math.round(fc.mu * 0.5)) {
      // Stock-out risk
      category = "stockout";
      const expected = Math.round(fc.mu);
      const shortfall = Math.max(0, expected - item.stock);
      rmImpact = Math.round(shortfall * cu * 100) / 100;
      action = `Restock ${nv.orderQty} units`;
      reason = `Stock ${item.stock} < expected demand ${expected} (P10=${fc.p10}). ${shortfall} units at risk. RM${rmImpact.toFixed(2)} lost margin if not restocked.`;
    } else {
      action = "No action needed";
      reason = `Stock ${item.stock} covers expected demand ${Math.round(fc.mu)} (P10=${fc.p10}, P90=${fc.p90}).`;
    }

    return {
      itemId: item.id,
      itemName: item.name,
      category,
      action,
      rmImpact,
      reason,
      orderQty: category === "expiry" ? 0 : nv.orderQty,
      markdownPercent,
      discountedPrice,
      supplier: SUPPLIERS[item.id] || "Unknown supplier",
    };
  });

  trace.push({
    agent: "Expiry Specialist",
    message: actions.filter((a) => a.category === "expiry").map((a) => `${a.itemName}: ${a.action}`).join("; ") || "No expiry actions needed.",
    timestamp: ts(),
  });

  // === Backtest for Rule 5 ===
  trace.push({ agent: "Planner", message: "Running 14-day backtest for baseline comparison.", timestamp: ts() });
  const bt = backtest(sales, items, 14);
  trace.push({
    agent: "Planner",
    message: `Backtest: baseline loss RM${bt.baselineLoss.toFixed(2)}, SmartStock loss RM${bt.smartStockLoss.toFixed(2)}, savings ${((1 - bt.smartStockLoss / bt.baselineLoss) * 100).toFixed(1)}%`,
    timestamp: ts(),
  });

  // === Validator ===
  trace.push({ agent: "Validator", message: "Running 5 validation rules on merged plan.", timestamp: ts() });
  let validation = validatePlan(actions, items, bt.baselineLoss, bt.smartStockLoss);
  let retries = 0;

  if (!validation.passed && retries < 2) {
    trace.push({
      agent: "Validator",
      message: `REJECT — ${validation.issues.length} issue(s): ${validation.issues.map((i) => i.message).join("; ")}`,
      timestamp: ts(),
    });

    // Revision: clip orders to limits, reduce if budget exceeded
    retries++;
    trace.push({
      agent: "Planner",
      message: `Revision attempt ${retries}: clipping orders to supplier limits and budget cap.`,
      timestamp: ts(),
    });

    // Fix: clip orders
    const revisedActions = actions.map((a, idx) => {
      const item = items[idx];
      let revisedQty = Math.min(a.orderQty, item.supplierLimit);
      revisedQty = Math.max(0, revisedQty);
      return { ...a, orderQty: revisedQty };
    });

    // Fix: if budget still exceeded, reduce largest orders first
    let totalSpend = revisedActions.reduce((sum, a, idx) => {
      const item = items[idx];
      return sum + a.orderQty * item.cost;
    }, 0);

    if (totalSpend > 250) {
      // Sort by orderQty desc, reduce
      const order = revisedActions.map((_, i) => i).sort((a, b) => revisedActions[b].orderQty - revisedActions[a].orderQty);
      for (const idx of order) {
        if (totalSpend <= 250) break;
        const item = items[idx];
        while (revisedActions[idx].orderQty > 0 && totalSpend > 250) {
          revisedActions[idx].orderQty--;
          totalSpend -= item.cost;
        }
      }
    }

    actions.splice(0, actions.length, ...revisedActions);
    trace.push({ agent: "Planner", message: `Revised orders applied. Total spend: RM${totalSpend.toFixed(2)}.`, timestamp: ts() });

    validation = validatePlan(actions, items, bt.baselineLoss, bt.smartStockLoss);

    if (validation.passed) {
      trace.push({ agent: "Validator", message: "PASS — all 5 rules satisfied after revision.", timestamp: ts() });
    } else if (retries < 2) {
      trace.push({ agent: "Validator", message: `REJECT — still failing: ${validation.issues.map((i) => i.message).join("; ")}`, timestamp: ts() });
    }
  }

  if (validation.passed) {
    trace.push({ agent: "Validator", message: "Plan approved. Deliverables ready.", timestamp: ts() });
  } else {
    trace.push({ agent: "Validator", message: "Max retries reached. Flagging for owner review.", timestamp: ts() });
  }

  const savingsPercent = bt.baselineLoss > 0
    ? Math.round((1 - bt.smartStockLoss / bt.baselineLoss) * 1000) / 10
    : 0;

  return {
    timestamp: new Date().toISOString(),
    goal: "Prepare plan for tomorrow",
    context,
    forecasts,
    newsvendor,
    actions: actions.sort((a, b) => b.rmImpact - a.rmImpact),
    validationIssues: validation.issues,
    retries,
    passed: validation.passed,
    baselineLoss: bt.baselineLoss,
    smartStockLoss: bt.smartStockLoss,
    savingsPercent,
    trace,
  };
}

// Chat keyword intent handler
export interface ChatResponse {
  text: string;
  tab?: string;
}

export function handleChatIntent(
  input: string,
  run: AgentRun | null
): ChatResponse {
  const q = input.toLowerCase().trim();

  if (q.includes("plan") || q.includes("prepare") || q.includes("restock")) {
    return {
      text: "Running agents now. View the Plan tab for your ranked action list.",
      tab: "plan",
    };
  }
  if (q.includes("why") && q.includes("order")) {
    if (!run) return { text: "Run the plan first, then ask about specific items." };
    const detail = run.actions.map((a) => `${a.itemName}: ${a.reason}`).join("\n");
    return { text: detail, tab: "plan" };
  }
  if (q.includes("risk") || q.includes("at risk")) {
    if (!run) return { text: "Run the plan first to see what's at risk." };
    const atRisk = run.actions.filter((a) => a.category !== "ok");
    return {
      text: atRisk.length
        ? atRisk.map((a) => `${a.itemName}: ${a.action} — RM${a.rmImpact.toFixed(2)}`).join("\n")
        : "No items at risk. All stock levels are healthy.",
      tab: "dashboard",
    };
  }
  if (q.includes("discount") || q.includes("markdown")) {
    if (!run) return { text: "Run the plan first to see markdown actions." };
    const discounts = run.actions.filter((a) => a.markdownPercent > 0);
    return {
      text: discounts.length
        ? discounts.map((a) => `${a.itemName}: ${Math.round(a.markdownPercent * 100)}% off → RM${a.discountedPrice.toFixed(2)}`).join("\n")
        : "No items need markdown today.",
      tab: "plan",
    };
  }
  if (q.includes("saving") || q.includes("baseline") || q.includes("backtest")) {
    if (!run) return { text: "Run the plan first to see savings." };
    return {
      text: `Baseline loss: RM${run.baselineLoss.toFixed(2)}\nSmartStock loss: RM${run.smartStockLoss.toFixed(2)}\nSavings: ${run.savingsPercent}% (${run.baselineLoss > 0 ? "RM" + (run.baselineLoss - run.smartStockLoss).toFixed(2) + " saved" : "N/A"})`,
      tab: "impact",
    };
  }
  if (q.includes("pay") || q.includes("worth") || q.includes("price") || q.includes("subscribe")) {
    return {
      text: "SmartStock tiers: Starter RM49/mo (1 outlet), Standard RM99/mo (2-5 outlets), Multi-outlet RM249/mo. Optional 10% of verified savings. Typical ROI ~6x at the Standard tier.",
      tab: "workbuddy",
    };
  }

  return {
    text: 'I understand: "plan" (run agents), "why order X" (explain), "what is at risk" (risk items), "discount" (markdowns), "savings" (backtest), "would an owner pay" (business model). Try one of those.',
  };
}
