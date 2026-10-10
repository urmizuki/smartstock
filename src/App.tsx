import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SAMPLE_ITEMS,
  SAMPLE_SALES,
  TOMORROW_DOW,
  TOMORROW_DATE,
} from "./lib/sample-data";
import { runAgents, RunContext } from "./lib/agents";
import { AgentRun } from "./lib/types";
import ChatTab from "./components/ChatTab";
import PlanTab from "./components/PlanTab";
import InventoryTab from "./components/InventoryTab";
import SubscriptionTab from "./components/SubscriptionTab";
import {
  LeafIcon,
  ChatIcon,
  InventoryIcon,
  PlanIcon,
  SparklesIcon,
} from "./components/icons";

type TabId = "chat" | "plan" | "inventory" | "pro";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "chat", label: "Chat", icon: ChatIcon },
  { id: "plan", label: "Plan", icon: PlanIcon },
  { id: "inventory", label: "Stock", icon: InventoryIcon },
  { id: "pro", label: "Pro", icon: SparklesIcon },
];

function formatTomorrowLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  return `Tomorrow · ${formatter.format(date)}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const [run, setRun] = useState<AgentRun | null>(null);
  const [context, setContext] = useState<RunContext>({
    payday: false,
    rain: false,
    holiday: null,
  });
  const [running, setRunning] = useState(false);

  const executeRun = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const result = runAgents(SAMPLE_ITEMS, SAMPLE_SALES, TOMORROW_DOW, context);
      setRun(result);
      setRunning(false);
    }, 800);
  }, [context]);

  const switchToPlan = useCallback(() => {
    setActiveTab("plan");
  }, []);

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 sticky top-0 h-screen border-r border-white/40 bg-white/70 backdrop-blur-2xl z-30 shadow-soft">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center border-2 border-white shadow-lift">
              <LeafIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-cream-100 leading-none">SmartStock</h1>
              <p className="text-xs text-cream-300/70 leading-none mt-1">Oreo · UPM</p>
            </div>
          </motion.div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-gold-500 to-gold-400 text-cream-100 shadow-lift"
                    : "text-cream-300/80 hover:text-cream-100 hover:bg-white/60"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-cream-100" : "text-cream-300/70"}`} />
                <span className="text-sm font-semibold">{tab.label}</span>
                {tab.id === "pro" && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 font-bold">
                    NEW
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Pro upsell mini-card */}
        <div className="p-4">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => setActiveTab("pro")}
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-fuchsia-600 text-white shadow-premium cursor-pointer"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-40" />
            <div className="relative z-10">
              <SparklesIcon className="w-5 h-5 mb-2 text-fuchsia-100" />
              <p className="text-sm font-bold">Try Pro free</p>
              <p className="text-xs text-white/80 mt-1">Unlock agents, proof & alerts.</p>
            </div>
          </motion.div>
        </div>

        <div className="p-4 border-t border-white/40">
          <button
            onClick={executeRun}
            disabled={running}
            className="btn-primary w-full text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? "Running agents..." : "Run agents"}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-white/60 shadow-soft">
          <div className="max-w-5xl mx-auto px-5">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center border-2 border-white shadow-lift">
                  <LeafIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-cream-100 leading-none">SmartStock</h1>
                  <p className="text-xs text-cream-300/70 leading-none mt-1">Oreo · UPM</p>
                </div>
              </div>
              <button
                onClick={executeRun}
                disabled={running}
                className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? "Running..." : "Run agents"}
              </button>
            </div>
          </div>
        </header>

        {/* Context controls */}
        <div className="bg-white/50 backdrop-blur-lg border-b border-white/60">
          <div className="max-w-6xl mx-auto px-5 py-3">
            <div className="flex items-center gap-4 text-sm overflow-x-auto">
              <span className="text-cream-300/60 font-medium shrink-0">Context</span>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <div className={`w-9 h-5 rounded-full relative transition-colors ${context.payday ? "bg-gold-500" : "bg-forest-700"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${context.payday ? "left-5" : "left-1"}`} />
                </div>
                <input
                  type="checkbox"
                  checked={context.payday}
                  onChange={(e) => setContext({ ...context, payday: e.target.checked })}
                  className="sr-only"
                />
                <span className="text-cream-200">Payday week</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <div className={`w-9 h-5 rounded-full relative transition-colors ${context.rain ? "bg-gold-500" : "bg-forest-700"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${context.rain ? "left-5" : "left-1"}`} />
                </div>
                <input
                  type="checkbox"
                  checked={context.rain}
                  onChange={(e) => setContext({ ...context, rain: e.target.checked })}
                  className="sr-only"
                />
                <span className="text-cream-200">Rain</span>
              </label>
              <span className="text-cream-300/50 ml-auto shrink-0 text-xs">
                {formatTomorrowLabel(TOMORROW_DATE)}
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-5 py-5 pb-28 lg:pb-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.175, 0.885, 0.32, 1.275] }}
            >
              {activeTab === "chat" && (
                <ChatTab
                  run={run}
                  onRun={executeRun}
                  onSwitchToPlan={switchToPlan}
                  onSwitchToPro={() => setActiveTab("pro")}
                  running={running}
                />
              )}
              {activeTab === "plan" && <PlanTab run={run} />}
              {activeTab === "inventory" && <InventoryTab />}
              {activeTab === "pro" && <SubscriptionTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile floating bottom nav */}
      <nav className="bottom-bar z-30 lg:hidden">
        <div className="max-w-5xl mx-auto px-2 py-2">
          <div className="flex items-center justify-around overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 min-w-[64px] cursor-pointer shrink-0 ${
                    isActive
                      ? "text-gold-600 bg-gold-100"
                      : "text-cream-300/70 hover:text-cream-200"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-gold-600" : ""}`} />
                  <span className="text-[10px] font-semibold leading-tight whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
