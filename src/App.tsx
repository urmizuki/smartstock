import { useState, useCallback } from "react";
import { SAMPLE_ITEMS, SAMPLE_SALES, TOMORROW_DOW } from "./lib/sample-data";
import { runAgents, RunContext } from "./lib/agents";
import { AgentRun } from "./lib/types";
import ChatTab from "./components/ChatTab";
import PlanTab from "./components/PlanTab";
import InventoryTab from "./components/InventoryTab";
import SubscriptionTab from "./components/SubscriptionTab";

type TabId = "orders" | "plan" | "menu" | "pro";

const TABS: { id: TabId; label: string; icon: string; count?: string }[] = [
  { id: "orders", label: "Orders", icon: "ph-chats" },
  { id: "plan", label: "Plan", icon: "ph-clipboard-text", count: "04" },
  { id: "menu", label: "Menu", icon: "ph-bowl-food", count: "06" },
  { id: "pro", label: "Pro", icon: "ph-crown-simple" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("orders");
  const [run, setRun] = useState<AgentRun | null>(null);
  const [context, setContext] = useState<RunContext>({ payday: false, rain: false, holiday: null });
  const [running, setRunning] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const executeRun = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const result = runAgents(SAMPLE_ITEMS, SAMPLE_SALES, TOMORROW_DOW, context);
      setRun(result);
      setRunning(false);
    }, 800);
  }, [context]);

  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* ============================ Rail ============================ */}
      <aside className="hidden min-[900px]:flex w-[246px] flex-none flex-col bg-forest-800 border-r-[3px] border-cream-100">
        <div className="flex items-center gap-3 p-4 border-b-[3px] border-cream-100">
          <div className="grid h-[42px] w-[42px] flex-none place-items-center bg-gold-500 text-forest-800">
            <i className="ph ph-storefront text-[19px]" />
          </div>
          <div>
            <div className="macro text-[17px] leading-none">Warung Oreo</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-cream-300">
              UPM · Canteen 01
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col" aria-label="Primary">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className="nav-item"
              aria-current={activeTab === tab.id ? "page" : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`ph ${tab.icon}`} />
              {tab.label}
              {tab.count && <span className="count">{tab.count}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t-[3px] border-cream-100 p-4">
          <div className="mb-3">
            <div className="macro text-[15px] leading-none">Oreo · UPM</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-cream-300">
              PIN DEMO-UPM-001
            </div>
          </div>
          <button className="btn-secondary w-full" onClick={() => setShowUpload(true)}>
            <i className="ph ph-upload-simple" />
            Upload
          </button>
          <button className="btn-primary mt-2 w-full" onClick={executeRun} disabled={running}>
            <i className={`ph ${running ? "ph-circle-notch animate-spin" : "ph-play"}`} />
            {running ? "Running…" : "Run agents"}
          </button>
        </div>
      </aside>

      {/* ============================ Main ============================ */}
      <div className="flex min-w-0 flex-1 flex-col bg-forest-900">
        <div className="awning" aria-hidden="true" />

        <div className="ticker">
          <span>
            <i className="ph ph-storefront" /> WARUNG OREO
          </span>
          <span className="sep">///</span>
          <span>CANTEEN 01 · UPM</span>
          <span className="sep">///</span>
          <span>MON 12 OCT</span>
          <span className="sep">///</span>
          <span>OPEN 07:00</span>
        </div>

        <header className="flex items-center gap-3 border-b-[3px] border-cream-100 bg-forest-800 px-4 py-3">
          <i className={`ph ${active.icon} text-[19px]`} />
          <span className="macro text-[17px]">{active.label}</span>
          <span className="flex-1" />
          <div className="flex items-center gap-4">
            <label className="toggle hidden sm:flex">
              <input
                type="checkbox"
                checked={context.payday}
                onChange={(e) => setContext({ ...context, payday: e.target.checked })}
              />
              <span className="box" />
              Payday
            </label>
            <label className="toggle hidden sm:flex">
              <input
                type="checkbox"
                checked={context.rain}
                onChange={(e) => setContext({ ...context, rain: e.target.checked })}
              />
              <span className="box" />
              Rain
            </label>
            <button className="btn-secondary hidden px-3 py-2 sm:inline-flex" onClick={() => setShowUpload(true)}>
              <i className="ph ph-upload-simple" />
            </button>
          </div>
        </header>

        {/* Screens */}
        <div className="flex min-h-0 flex-1 flex-col">
          <section className={`min-h-0 flex-1 flex-col ${activeTab === "orders" ? "flex" : "hidden"}`}>
            <ChatTab
              run={run}
              running={running}
              onRun={executeRun}
              onSwitchToPlan={() => setActiveTab("plan")}
            />
          </section>
          <section className={`min-h-0 flex-1 flex-col ${activeTab === "plan" ? "flex" : "hidden"}`}>
            <PlanTab run={run} />
          </section>
          <section className={`min-h-0 flex-1 flex-col ${activeTab === "menu" ? "flex" : "hidden"}`}>
            <InventoryTab />
          </section>
          <section className={`min-h-0 flex-1 flex-col ${activeTab === "pro" ? "flex" : "hidden"}`}>
            <SubscriptionTab />
          </section>
        </div>

        {/* Mobile bottom nav */}
        <nav className="bottom-bar flex min-[900px]:hidden" aria-label="Primary">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className="nav-item"
              aria-current={activeTab === tab.id ? "page" : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`ph ${tab.icon}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ============================ Upload modal ============================ */}
      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setShowUpload(false)}
        >
          <div className="panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center bg-gold-500 text-forest-800">
                <i className="ph ph-upload-simple text-[19px]" />
              </div>
              <div>
                <h3 className="macro text-[19px]">Upload store data</h3>
                <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-cream-300">
                  PIN: DEMO-UPM-001
                </p>
              </div>
            </div>
            <p className="text-[13px] text-cream-200">
              In production each canteen connects its store PIN and uploads a daily CSV of sales and stock. This
              demo loads synthetic sample data automatically.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-start gap-3 text-[13px] text-cream-200">
                <span className="stamp">1</span> Export sales + stock from your POS as CSV.
              </div>
              <div className="flex items-start gap-3 text-[13px] text-cream-200">
                <span className="stamp">2</span> Upload to your SmartStock PIN portal.
              </div>
              <div className="flex items-start gap-3 text-[13px] text-cream-200">
                <span className="stamp">3</span> Agents retrain on your real history every night.
              </div>
            </div>
            <div className="mt-5 border-[2px] border-dashed border-cream-100 bg-forest-700 p-3 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-cream-300">
                Demo mode — upload is disabled
              </p>
            </div>
            <button className="btn-primary mt-4 w-full" onClick={() => setShowUpload(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
