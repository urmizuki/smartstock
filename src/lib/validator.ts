// Validator: 5 rules, max 2 retries
// 1. Orders are integers >= 0
// 2. Order <= supplier limit
// 3. Total order spend <= budget cap (RM250)
// 4. Markdown price >= cost
// 5. Plan beats baseline in backtest

import { ActionResult, ValidationIssue, Item } from "./types";

export const BUDGET_CAP = 250;

interface ValidationResult {
  issues: ValidationIssue[];
  passed: boolean;
}

export function validatePlan(
  actions: ActionResult[],
  items: Item[],
  baselineLoss: number,
  smartStockLoss: number
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Rule 1: Orders are integers >= 0
  for (const a of actions) {
    if (a.orderQty < 0 || !Number.isInteger(a.orderQty)) {
      issues.push({
        rule: "1 — Integer >= 0",
        message: `${a.itemName}: order ${a.orderQty} is not a non-negative integer`,
        itemId: a.itemId,
      });
    }
  }

  // Rule 2: Order <= supplier limit
  for (const a of actions) {
    const item = items.find((i) => i.id === a.itemId);
    if (item && a.orderQty > item.supplierLimit) {
      issues.push({
        rule: "2 — Supplier limit",
        message: `${a.itemName}: order ${a.orderQty} exceeds supplier limit ${item.supplierLimit}`,
        itemId: a.itemId,
      });
    }
  }

  // Rule 3: Total order spend <= budget cap
  const totalSpend = actions.reduce((sum, a) => {
    const item = items.find((i) => i.id === a.itemId);
    return sum + (item ? a.orderQty * item.cost : 0);
  }, 0);
  if (totalSpend > BUDGET_CAP) {
    issues.push({
      rule: "3 — Budget cap",
      message: `Total order spend RM${totalSpend.toFixed(2)} exceeds budget cap RM${BUDGET_CAP}`,
    });
  }

  // Rule 4: Markdown price >= cost
  for (const a of actions) {
    if (a.markdownPercent > 0) {
      const item = items.find((i) => i.id === a.itemId);
      if (item && a.discountedPrice < item.cost) {
        issues.push({
          rule: "4 — Markdown >= cost",
          message: `${a.itemName}: discounted price RM${a.discountedPrice.toFixed(2)} below cost RM${item.cost.toFixed(2)}`,
          itemId: a.itemId,
        });
      }
    }
  }

  // Rule 5: Plan beats baseline
  if (smartStockLoss >= baselineLoss) {
    issues.push({
      rule: "5 — Beats baseline",
      message: `SmartStock loss RM${smartStockLoss.toFixed(2)} >= baseline RM${baselineLoss.toFixed(2)}`,
    });
  }

  return {
    issues,
    passed: issues.length === 0,
  };
}
