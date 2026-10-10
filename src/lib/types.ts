// Core domain types for SmartStock

export interface Item {
  id: string;
  name: string;
  category: "main" | "drink" | "snack";
  price: number; // selling price RM
  cost: number; // cost price RM
  supplierLimit: number; // max order per day
  stock: number; // current stock on hand
  expiry?: {
    date: string; // ISO date
    hour?: number; // hour of expiry
    discount: number; // suggested discount % (0-1)
  };
  shelfLifeDays: number; // for spoilage estimation
}

export interface DailySales {
  date: string; // ISO date
  itemId: string;
  unitsSold: number;
}

export interface ForecastResult {
  itemId: string;
  mu: number; // mean demand
  sd: number; // std dev (min 1)
  p10: number; // 10th percentile
  p90: number; // 90th percentile
}

export interface NewsvendorResult {
  itemId: string;
  cu: number; // understock cost (lost margin)
  co: number; // overstock cost (waste)
  cr: number; // critical ratio
  orderQty: number; // recommended order
  expectedUnits: number; // expected demand (mu)
}

export type RiskCategory = "stockout" | "expiry" | "ok";

export interface ActionResult {
  itemId: string;
  itemName: string;
  category: RiskCategory;
  action: string;
  rmImpact: number; // RM at risk or RM recovered
  reason: string;
  orderQty: number;
  markdownPercent: number; // 0 if no markdown
  discountedPrice: number; // 0 if no markdown
  supplier: string;
}

export interface ValidationIssue {
  rule: string;
  message: string;
  itemId?: string;
}

export interface AgentRun {
  timestamp: string;
  goal: string;
  context: { payday: boolean; rain: boolean; holiday: string | null };
  forecasts: ForecastResult[];
  newsvendor: NewsvendorResult[];
  actions: ActionResult[];
  validationIssues: ValidationIssue[];
  retries: number;
  passed: boolean;
  baselineLoss: number;
  smartStockLoss: number;
  savingsPercent: number;
  trace: TraceStep[];
}

export interface TraceStep {
  agent: string;
  message: string;
  timestamp: string;
}

export interface SalesData {
  items: Item[];
  dailySales: DailySales[];
}
