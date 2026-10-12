import { useState } from "react";
import { AgentRun } from "../lib/types";
import { SAMPLE_ITEMS, SAMPLE_SALES } from "../lib/sample-data";
import { backtest } from "../lib/backtest";

interface Props {
  run: AgentRun | null;
}

export default function PlanTab({ run }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!run) {
    return (
      <div className="scroll-area min-h-0 flex-1 overflow-y-auto p-5">
        <div className="special rise">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-500">
            Order sheet · Mon 12 Oct
          </div>
          <h1 className="macro mt-2 text-[clamp(30px,6vw,52px)]">No plan yet</h1>
          <p className="mt-3 max-w-[52ch] text-[13px]">
            Run the agents from the Orders tab and the ranked order sheet appears here.
          </p>
        </div>
      </div>
    );
  }

  const totalRmImpact = run.actions.reduce((s, a) => s + a.rmImpact, 0);
  const restockActions = run.actions.filter((a) => a.orderQty > 0);
  const markdownActions = run.actions.filter((a) => a.markdownPercent > 0);
  const orderUnits = run.actions.reduce((s, a) => s + a.orderQty, 0);
  const spend = restockActions.reduce((s, a) => {
    const item = SAMPLE_ITEMS.find((i) => i.id === a.itemId)!;
    return s + a.orderQty * item.cost;
  }, 0);

  const bt = backtest(SAMPLE_SALES, SAMPLE_ITEMS, 14);
  const maxLoss = Math.max(...bt.perItem.map((p) => p.baseline), 1);

  const suppliers = [...new Set(restockActions.map((a) => a.supplier))];

  return (
    <div className="scroll-area min-h-0 flex-1 overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="special rise">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-500">
            Order sheet · Mon 12 Oct
          </div>
          <h1 className="macro mt-2 text-[clamp(30px,6vw,52px)]">Today's plan</h1>
          <p className="mt-3 max-w-[52ch] text-[13px]">
            Ranked by the ringgit each action saves, validated against budget and supplier limits.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 border-t-[2px] border-paper/25 pt-4">
            <span className="chalk-tag hot">
              <i className="ph ph-seal-check" /> {run.passed ? "Validated" : "Review"}
            </span>
            <span className="chalk-tag">
              <i className="ph ph-clock" /> Ready by 06:00
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="metrics-grid rise !grid-cols-2 min-[720px]:!grid-cols-4">
          <div className="m">
            <div className="k">Actions</div>
            <div className="v">{run.actions.filter((a) => a.category !== "ok").length}</div>
          </div>
          <div className="m">
            <div className="k">RM impact</div>
            <div className="v text-risk-500">{totalRmImpact.toFixed(2)}</div>
          </div>
          <div className="m">
            <div className="k">Order units</div>
            <div className="v">{orderUnits}</div>
          </div>
          <div className="m">
            <div className="k">Status</div>
            <div className={`v ${run.passed ? "text-stock-500" : "text-risk-500"}`}>
              {run.passed ? "OK" : "REVIEW"}
            </div>
          </div>
        </div>

        {/* Ranked actions */}
        <div className="panel rise">
          <div className="panel-head">
            <i className="ph ph-list-numbers" /> Ranked actions
            <span className="flex-1" />
            <span className="n">BY IMPACT</span>
          </div>
          <div>
            {run.actions.map((a, i) => {
              const item = SAMPLE_ITEMS.find((x) => x.id === a.itemId)!;
              const fc = run.forecasts.find((f) => f.itemId === a.itemId)!;
              const open = openId === a.itemId;
              const max = Math.max(fc.p90, item.stock, 1);
              const w = (v: number) => `${Math.max(v > 0 ? 2 : 0, Math.round((v / max) * 100))}%`;
              return (
                <div key={a.itemId} className={`rank-row ${open ? "open" : ""}`} style={{ ["--d" as string]: `${Math.min(i, 6) * 40}ms` }}>
                  <div className="idx">{i + 1}</div>
                  <div>
                    <div className="t">{a.itemName}</div>
                    <div className="mt-1 text-[13px] font-semibold">{a.action}</div>
                    <div className="mt-1.5 max-w-[62ch] font-mono text-[10px] uppercase tracking-[0.05em] text-cream-300">
                      {a.reason}
                    </div>
                    <button className="why-toggle" onClick={() => setOpenId(open ? null : a.itemId)}>
                      {a.category === "ok" ? "Why no action?" : "Why this action?"}
                      <i className="ph ph-caret-down" />
                    </button>
                    <div className="why-body">
                      <div className="why-note">{a.reason}</div>
                      <div className="fc">
                        <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-cream-300">
                          Forecast vs stock
                        </div>
                        <div className="pb">
                          <span className="lb">P10</span>
                          <span className="track">
                            <span className="fill" style={{ width: w(fc.p10) }} />
                          </span>
                          <span className="val">{fc.p10}</span>
                        </div>
                        <div className="pb">
                          <span className="lb">Expected</span>
                          <span className="track">
                            <span className="fill" style={{ width: w(fc.mu) }} />
                          </span>
                          <span className="val">{fc.mu}</span>
                        </div>
                        <div className="pb">
                          <span className="lb">P90</span>
                          <span className="track">
                            <span className="fill" style={{ width: w(fc.p90) }} />
                          </span>
                          <span className="val">{fc.p90}</span>
                        </div>
                        <div className="pb">
                          <span className="lb">Stock</span>
                          <span className="track">
                            <span
                              className={`fill ${a.category === "ok" ? "good" : "risk"}`}
                              style={{ width: w(item.stock) }}
                            />
                          </span>
                          <span className="val">{item.stock}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {a.rmImpact > 0 && (
                    <span className={`price ${a.category === "expiry" ? "ok" : "risk"}`}>
                      RM {a.rmImpact.toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Markdown signs */}
        {markdownActions.length > 0 && (
          <div className="grid grid-cols-1 gap-4 min-[700px]:grid-cols-2">
            {markdownActions.map((a) => (
              <div key={a.itemId} className="sign rise" style={{ transform: "rotate(-1.2deg)" }}>
                <div className="dish-name">{a.itemName}</div>
                <div className="off">{Math.round(a.markdownPercent * 100)}% OFF</div>
                <div className="was">
                  RM {a.discountedPrice.toFixed(2)} <s>RM {(a.discountedPrice / (1 - a.markdownPercent)).toFixed(2)}</s>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Supplier receipt */}
        {restockActions.length > 0 && (
          <div className="receipt rise">
            <div className="rhead">WARUNG OREO · ORDER</div>
            <div className="rsub">PIN DEMO-UPM-001 · MON 12 OCT</div>
            {restockActions.map((a) => (
              <div key={a.itemId} className="rline">
                <span>
                  {a.itemName} × {a.orderQty}
                </span>
                <span className="dots" />
                <span>
                  {(a.orderQty * (SAMPLE_ITEMS.find((i) => i.id === a.itemId)?.cost ?? 0)).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="rtotal">
              <span>SPEND</span>
              <span>RM {spend.toFixed(2)}</span>
            </div>
            <div className="rtotal !border-0 !pt-1">
              <span>AT RISK IF SKIPPED</span>
              <span>RM {totalRmImpact.toFixed(2)}</span>
            </div>
            {suppliers.map((s) => (
              <div key={s} className="mt-3 border-t-[2px] border-dashed border-cream-100 pt-2.5 font-bold">
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Proof */}
        <div className="panel rise">
          <div className="panel-head">
            <i className="ph ph-chart-bar" /> Proof
            <span className="flex-1" />
            <span className="n">14-DAY BACKTEST</span>
          </div>
          <div className="p-4">
            <div className="metrics-grid mb-4 !grid-cols-2 !border-0 !shadow-none min-[720px]:!grid-cols-4">
              <div className="m">
                <div className="k">Baseline loss</div>
                <div className="v text-risk-500">{bt.baselineLoss.toFixed(2)}</div>
              </div>
              <div className="m">
                <div className="k">With SmartStock</div>
                <div className="v text-stock-500">{bt.smartStockLoss.toFixed(2)}</div>
              </div>
              <div className="m">
                <div className="k">Saved</div>
                <div className="v">{(bt.baselineLoss - bt.smartStockLoss).toFixed(2)}</div>
              </div>
              <div className="m">
                <div className="k">Savings</div>
                <div className="v text-stock-500">{run.savingsPercent}%</div>
              </div>
            </div>

            {bt.perItem.map((p) => {
              const item = SAMPLE_ITEMS.find((i) => i.id === p.itemId)!;
              return (
                <div key={p.itemId} className="border-b-[2px] border-cream-100 py-3 last:border-0">
                  <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em]">{item.name}</div>
                  <div className="pb">
                    <span className="lb">Baseline</span>
                    <span className="track">
                      <span className="fill risk" style={{ width: `${Math.max(2, (p.baseline / maxLoss) * 100)}%` }} />
                    </span>
                    <span className="val">{p.baseline}</span>
                  </div>
                  <div className="pb">
                    <span className="lb">SmartStock</span>
                    <span className="track">
                      <span className="fill good" style={{ width: `${Math.max(2, (p.smartstock / maxLoss) * 100)}%` }} />
                    </span>
                    <span className="val">{p.smartstock}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
