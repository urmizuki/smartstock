import { useState } from "react";
import { motion } from "framer-motion";
import { AgentRun } from "../lib/types";
import { SAMPLE_ITEMS, SAMPLE_SALES } from "../lib/sample-data";
import { backtest } from "../lib/backtest";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { PlanIcon, ChevronRightIcon } from "./icons";

interface Props {
  run: AgentRun | null;
}

const CHART_AXIS = { stroke: "#E5E7EB", fill: "#6B7280" };
const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  color: "#10162F",
  boxShadow: "0 10px 40px -10px rgba(16, 22, 47, 0.12)",
};

function WhyCard({ action, run }: { action: AgentRun["actions"][0]; run: AgentRun }) {
  const [open, setOpen] = useState(false);
  const item = SAMPLE_ITEMS.find((i) => i.id === action.itemId)!;
  const forecast = run.forecasts.find((f) => f.itemId === action.itemId)!;

  const forecastChartData = [
    { name: "P10 low", value: forecast.p10 },
    { name: "Expected", value: forecast.mu },
    { name: "P90 high", value: forecast.p90 },
    { name: "Stock", value: item.stock },
  ];

  return (
    <div className="mt-3 border-t border-sage-400/20 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-bold text-gold-600 hover:text-gold-500 transition-colors cursor-pointer"
      >
        Why this action?
        <ChevronRightIcon className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 space-y-3 overflow-hidden"
        >
          <p className="text-sm text-cream-200 bg-forest-700/50 rounded-xl p-3">{action.reason}</p>
          <div className="bg-forest-700/30 rounded-xl p-3">
            <p className="text-xs text-cream-300/60 mb-2">Forecast vs stock</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={forecastChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART_AXIS.fill }} stroke={CHART_AXIS.stroke} />
                <YAxis tick={{ fontSize: 10, fill: CHART_AXIS.fill }} stroke={CHART_AXIS.stroke} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill="#F7C948" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function PlanTab({ run }: Props) {
  if (!run) {
    return (
      <div className="surface-elevated p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-4 shadow-lift">
          <PlanIcon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-cream-100 text-lg">No plan yet</h3>
        <p className="text-cream-300/60 text-sm mt-2">Run the agents from Chat to generate the ranked action plan.</p>
      </div>
    );
  }

  const totalRmImpact = run.actions.reduce((sum, a) => sum + a.rmImpact, 0);
  const restockActions = run.actions.filter((a) => a.orderQty > 0);
  const markdownActions = run.actions.filter((a) => a.markdownPercent > 0);

  const bt = backtest(SAMPLE_SALES, SAMPLE_ITEMS, 14);
  const proofChartData = bt.perItem.map((p) => {
    const item = SAMPLE_ITEMS.find((i) => i.id === p.itemId)!;
    return {
      name: item.name,
      baseline: p.baseline,
      smartstock: p.smartstock,
    };
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-elevated p-6 shine-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lift">
            <PlanIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-cream-100 text-xl font-bold">Today's plan</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="metric-card text-center">
            <p className="text-[10px] text-cream-300/60 uppercase font-bold tracking-wider">Actions</p>
            <p className="text-2xl font-extrabold text-cream-100">{run.actions.filter((a) => a.category !== "ok").length}</p>
          </div>
          <div className="metric-card text-center">
            <p className="text-[10px] text-cream-300/60 uppercase font-bold tracking-wider">RM impact</p>
            <p className="text-2xl font-extrabold text-gold-600">RM{totalRmImpact.toFixed(2)}</p>
          </div>
          <div className="metric-card text-center">
            <p className="text-[10px] text-cream-300/60 uppercase font-bold tracking-wider">Order units</p>
            <p className="text-2xl font-extrabold text-cream-100">{run.actions.reduce((s, a) => s + a.orderQty, 0)}</p>
          </div>
          <div className="metric-card text-center">
            <p className="text-[10px] text-cream-300/60 uppercase font-bold tracking-wider">Status</p>
            <p className={`text-xl font-extrabold ${run.passed ? "text-stock-500" : "text-risk-500"}`}>
              {run.passed ? "Validated" : "Review"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Ranked actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="surface-elevated p-6"
      >
        <h3 className="text-cream-100 mb-4 text-lg font-bold">Ranked actions</h3>
        <div className="space-y-3">
          {run.actions.map((a, i) => (
            <motion.div
              key={a.itemId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -3, scale: 1.005 }}
              className="surface-card p-4 pop-card cursor-default"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lift">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-cream-100">{a.itemName}</span>
                      <span className={`badge ${
                        a.category === "stockout" ? "badge-stockout" :
                        a.category === "expiry" ? "badge-expiry" : "badge-ok"
                      }`}>
                        {a.category}
                      </span>
                    </div>
                    <p className="text-sm text-cream-200 mt-1 font-medium">{a.action}</p>
                    <p className="text-xs text-cream-300/50 mt-1">{a.reason}</p>
                    <WhyCard action={a} run={run} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {a.rmImpact > 0 && (
                    <p className="text-base font-bold text-gold-600">RM{a.rmImpact.toFixed(2)}</p>
                  )}
                  {a.discountedPrice > 0 && (
                    <p className="text-xs text-expiry-500">
                      RM{a.discountedPrice.toFixed(2)} <span className="text-cream-300/40 line-through">RM{(a.discountedPrice / (1 - a.markdownPercent)).toFixed(2)}</span>
                    </p>
                  )}
                  {a.orderQty > 0 && (
                    <p className="text-xs text-cream-300/50 mt-1">Order {a.orderQty}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Discount signage */}
      {markdownActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="surface-elevated p-6"
        >
          <h3 className="text-cream-100 mb-4 text-lg font-bold">Discount signage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {markdownActions.map((a) => (
              <motion.div
                key={a.itemId}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-gradient-to-br from-amber-50 to-white border-2 border-dashed border-expiry-500/50 rounded-3xl p-6 text-center shadow-pop"
              >
                <p className="text-[10px] text-expiry-600 font-bold uppercase tracking-wider">Markdown</p>
                <p className="text-lg font-bold text-cream-100 mt-1">{a.itemName}</p>
                <p className="text-4xl font-extrabold text-expiry-500 mt-2">
                  {Math.round(a.markdownPercent * 100)}% OFF
                </p>
                <p className="text-sm text-cream-300/80 mt-2">
                  RM{a.discountedPrice.toFixed(2)} <span className="text-cream-300/40 line-through ml-1">RM{(a.discountedPrice / (1 - a.markdownPercent)).toFixed(2)}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Supplier message */}
      {restockActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="surface-elevated p-6"
        >
          <h3 className="text-cream-100 mb-3 text-lg font-bold">Supplier message</h3>
          <pre className="text-xs font-mono bg-forest-700/30 rounded-xl p-4 text-cream-300/80 whitespace-pre-wrap border border-sage-400/20">
{restockActions.map((a) => {
  const nv = run.newsvendor.find((n) => n.itemId === a.itemId)!;
  return `${a.supplier}\n  - ${a.itemName}: ${a.orderQty} units @ RM${(a.orderQty * nv.co).toFixed(2)}`;
}).join("\n\n")}
          </pre>
        </motion.div>
      )}

      {/* Proof section (merged Impact) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="surface-elevated p-6 shine-border"
      >
        <h3 className="text-cream-100 mb-1 text-lg font-bold">Proof</h3>
        <p className="text-xs text-cream-300/50 mb-5">14-day backtest · baseline = same day last week</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="metric-card text-center">
            <p className="text-[10px] text-cream-300/60 uppercase font-bold tracking-wider">Baseline loss</p>
            <p className="text-xl font-bold text-risk-500">RM{run.baselineLoss.toFixed(2)}</p>
          </div>
          <div className="metric-card text-center">
            <p className="text-[10px] text-cream-300/60 uppercase font-bold tracking-wider">SmartStock loss</p>
            <p className="text-xl font-bold text-stock-500">RM{run.smartStockLoss.toFixed(2)}</p>
          </div>
          <div className="metric-card text-center">
            <p className="text-[10px] text-cream-300/60 uppercase font-bold tracking-wider">Saved</p>
            <p className="text-xl font-bold text-gold-600">RM{(run.baselineLoss - run.smartStockLoss).toFixed(2)}</p>
          </div>
          <div className="metric-card text-center">
            <p className="text-[10px] text-cream-300/60 uppercase font-bold tracking-wider">Savings</p>
            <p className="text-xl font-bold text-stock-500">{run.savingsPercent}%</p>
          </div>
        </div>

        <div className="bg-white/50 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={proofChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART_AXIS.fill }} stroke={CHART_AXIS.stroke} />
              <YAxis tick={{ fontSize: 10, fill: CHART_AXIS.fill }} stroke={CHART_AXIS.stroke} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="baseline" name="Baseline loss" fill="#ef4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="smartstock" name="SmartStock loss" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
