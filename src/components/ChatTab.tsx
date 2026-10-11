import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentRun } from "../lib/types";
import { handleChatIntent } from "../lib/agents";
import { LeafIcon, PlanIcon, SparklesIcon, PinIcon, UploadIcon } from "./icons";

interface Props {
  run: AgentRun | null;
  onRun: () => void;
  onSwitchToPlan: () => void;
  onSwitchToPro: () => void;
  onShowUpload: () => void;
  running: boolean;
}

interface Message {
  role: "user" | "assistant" | "trace";
  text: string;
  agent?: string;
}

const SUGGESTIONS = [
  "Prepare the plan",
  "What is at risk?",
  "Show discounts",
  "Savings vs baseline",
];

export default function ChatTab({ run, onRun, onSwitchToPlan, onSwitchToPro, onShowUpload, running }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Morning. Tell me what you need for tomorrow — or tap a suggestion below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When a run result arrives, stream its trace then show the summary card.
  useEffect(() => {
    if (!run) return;

    const streamTrace = async () => {
      setStreaming(true);
      setMessages((prev) => prev.filter((m) => m.role !== "trace"));

      for (const step of run.trace) {
        setMessages((prev) => [
          ...prev,
          {
            role: "trace",
            agent: step.agent,
            text: step.message,
          },
        ]);
        await new Promise((r) => setTimeout(r, 450));
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Plan ready. ${run.actions.filter((a) => a.category !== "ok").length} action(s) need your attention today. Total impact RM${run.actions.reduce((sum, a) => sum + a.rmImpact, 0).toFixed(2)}.`,
        },
      ]);
      setStreaming(false);
    };

    streamTrace();
  }, [run]);

  const send = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const lower = text.toLowerCase();
    if (lower.includes("plan") || lower.includes("prepare") || lower.includes("restock")) {
      onRun();
      return;
    }

    const response = handleChatIntent(text, run);
    setMessages((m) => [...m, { role: "assistant", text: response.text }]);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-188px)] sm:h-[calc(100dvh-176px)] min-h-[320px]">
      {/* Welcome hero — compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="surface-elevated p-4 sm:p-6 mb-3 sm:mb-4 shine-border relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-bl from-gold-200/30 to-transparent rounded-full blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-cream-300/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">SmartStock</p>
            <h2 className="text-xl sm:text-3xl font-extrabold mt-1 sm:mt-2 leading-tight">Tomorrow's plan,<br className="hidden sm:block" /> one prompt away.</h2>
            <p className="text-cream-300/80 text-xs sm:text-sm mt-2 max-w-sm hidden sm:block">
              Restock, markdown, and supplier message — ranked by how much money each action saves.
            </p>
          </div>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center border-2 border-white shadow-lift shrink-0">
            <LeafIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
          </div>
        </div>
      </motion.div>

      {/* PIN / Upload banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.5 }}
        className="surface-elevated p-3 sm:p-4 mb-3 sm:mb-4 border-l-4 border-sky-300"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
              <PinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-cream-100" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-cream-100 truncate">Oreo · UPM</p>
              <p className="text-[10px] sm:text-xs text-cream-300/70 truncate">PIN: DEMO-UPM-001 · Sample data loaded</p>
            </div>
          </div>
          <button
            onClick={onShowUpload}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-sage-400/40 text-[10px] sm:text-xs font-semibold text-cream-200 hover:border-gold-500 hover:text-gold-600 transition-colors cursor-pointer"
          >
            <UploadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Upload data</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </motion.div>

      {/* Pro upsell card — thin banner on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        whileHover={{ y: -2, scale: 1.01 }}
        className="surface-premium p-3 sm:p-4 mb-3 sm:mb-4 cursor-pointer"
        onClick={onSwitchToPro}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center shrink-0">
            <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-cream-100 truncate">Try SmartStock Pro free for 14 days</p>
            <p className="text-[10px] sm:text-xs text-cream-300/70 truncate">Agents, expiry markdowns, and savings proof.</p>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-fuchsia-600 bg-fuchsia-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shrink-0">Upgrade</span>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "trace" ? (
                <div className="max-w-[90%] rounded-2xl px-4 py-2.5 text-sm bg-white/80 backdrop-blur border border-white/70 shadow-soft">
                  <span className="font-semibold text-gold-600">{msg.agent}</span>
                  <span className="text-cream-300/80 ml-2">{msg.text}</span>
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-soft ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-gold-400 to-gold-600 text-white font-semibold"
                      : "bg-white/90 backdrop-blur text-cream-100 border border-white/70"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {running && !streaming && (
          <div className="flex justify-start">
            <div className="bg-white/80 backdrop-blur border border-white/70 rounded-2xl px-4 py-3 text-sm text-cream-300/70 flex items-center gap-2 shadow-soft">
              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />
              Agents running...
            </div>
          </div>
        )}

        {/* Summary card linking to Plan */}
        <AnimatePresence>
          {run && !running && !streaming && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
              className="surface-elevated p-4 border-l-4 border-gold-500"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-cream-100 font-semibold">Plan summary</h3>
                  <p className="text-sm text-cream-300/70 mt-1">
                    {run.actions.filter((a) => a.category !== "ok").length} actions ·{" "}
                    {run.actions.filter((a) => a.category === "stockout").length} restock ·{" "}
                    {run.actions.filter((a) => a.category === "expiry").length} markdown
                  </p>
                  <p className="text-sm text-cream-200 mt-1">
                    Backtest saves {run.savingsPercent}% vs baseline.
                  </p>
                </div>
                <button
                  onClick={onSwitchToPlan}
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-2 shrink-0"
                >
                  <PlanIcon className="w-4 h-4" />
                  View plan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {!run && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-2 sm:pb-3">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ y: -2, scale: 1.03 }}
              onClick={() => send(s)}
              className="text-[11px] sm:text-xs bg-white/80 backdrop-blur border border-sage-400/40 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-cream-200 hover:border-gold-500 hover:text-gold-600 transition-colors cursor-pointer shadow-soft"
            >
              {s}
            </motion.button>
          ))}
        </div>
      )}

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about tomorrow's plan..."
          className="input-field flex-1 text-sm"
        />
        <button
          onClick={() => send(input)}
          className="btn-primary px-4 sm:px-5 text-sm"
        >
          Send
        </button>
      </motion.div>
    </div>
  );
}
