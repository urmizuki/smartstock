import { useState, useRef, useEffect } from "react";
import { AgentRun } from "../lib/types";
import { handleChatIntent } from "../lib/agents";

interface Props {
  run: AgentRun | null;
  running: boolean;
  onRun: () => void;
  onSwitchToPlan: () => void;
}

interface Message {
  role: "user" | "assistant" | "trace" | "summary";
  text: string;
  agent?: string;
}

const SUGGESTIONS = ["Prepare the plan", "What is at risk?", "Show discounts", "Savings vs baseline"];

export default function ChatTab({ run, running, onRun, onSwitchToPlan }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Pagi kak. Tell me what you need for tomorrow — or tap a suggestion below." },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The stream is append-only, so the newest turn is always at the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streaming, running]);

  useEffect(() => {
    if (!run) return;
    let cancelled = false;
    const streamTrace = async () => {
      setStreaming(true);
      setMessages((prev) => prev.filter((m) => m.role !== "trace" && m.role !== "summary"));
      for (const step of run.trace) {
        if (cancelled) return;
        setMessages((prev) => [...prev, { role: "trace", agent: step.agent, text: step.message }]);
        await new Promise((r) => setTimeout(r, 400));
      }
      if (cancelled) return;
      const acts = run.actions.filter((a) => a.category !== "ok").length;
      const total = run.actions.reduce((s, a) => s + a.rmImpact, 0);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Plan siap. ${acts} things need your attention — RM ${total.toFixed(2)} total impact.` },
        { role: "summary", text: "" },
      ]);
      setStreaming(false);
    };
    streamTrace();
    return () => {
      cancelled = true;
    };
  }, [run]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    const lower = text.toLowerCase();
    if (lower.includes("plan") || lower.includes("prepare") || lower.includes("restock")) {
      onRun();
      return;
    }
    const res = handleChatIntent(text, run);
    setMessages((m) => [...m, { role: "assistant", text: res.text }]);
  };

  const soldOut = run ? run.actions.filter((a) => a.category === "stockout").length : 3;
  const markdowns = run ? run.actions.filter((a) => a.category === "expiry").length : 1;
  const impact = run ? run.actions.reduce((s, a) => s + a.rmImpact, 0) : 152.16;
  const needsAction = run ? run.actions.filter((a) => a.category !== "ok") : [];

  return (
    <>
      <div ref={scrollRef} className="scroll-area flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        {/* Chalk special */}
        <div className="special rise" style={{ ["--d" as string]: "0ms" }}>
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-500">
            Today's special · Mon 12 Oct
          </div>
          <h1 className="macro mt-2 text-[clamp(30px,6vw,52px)]">
            {run ? "Kak, some dishes habis." : "Pagi kak."}
          </h1>
          <p className="mt-3 max-w-[52ch] text-[13px]">
            {run
              ? `${soldOut} dish${soldOut === 1 ? "" : "es"} sold out before the rush. Order more, mark down what expires, and skip the rest.`
              : "Tell me what you need for tomorrow and I'll rank every restock and markdown by the ringgit it saves."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 border-t-[2px] border-paper/25 pt-4">
            <span className="chalk-tag hot">
              <i className="ph ph-warning" /> {soldOut} sold out
            </span>
            <span className="chalk-tag">
              <i className="ph ph-tag" /> {markdowns} markdown
            </span>
            <span className="chalk-tag">
              <i className="ph ph-coins" /> RM {impact.toFixed(2)} impact
            </span>
          </div>
        </div>

        {/* Conversation */}
        {messages.map((m, i) => {
          if (m.role === "trace") {
            return (
              <div
                key={i}
                className="rise flex max-w-[70ch] items-start gap-3 border-[2px] border-cream-100 bg-forest-800 px-4 py-2.5 font-mono text-[11px]"
              >
                <span className="flex-none font-bold uppercase tracking-[0.06em] text-brown-500">{m.agent}</span>
                <span className="text-cream-300">{m.text}</span>
              </div>
            );
          }
          if (m.role === "summary") {
            if (!run) return null;
            return (
              <div key={i} className="panel rise max-w-[76ch]" style={{ ["--d" as string]: "0ms" }}>
                <div className="panel-head">
                  <i className="ph ph-clipboard-text" /> Plan summary
                  <span className="flex-1" />
                  <span className="n">READY</span>
                </div>
                <div className="metrics-grid !grid-cols-2 !border-0 !shadow-none min-[720px]:!grid-cols-4">
                  <div className="m">
                    <div className="k">Actions</div>
                    <div className="v">{run.actions.filter((a) => a.category !== "ok").length}</div>
                  </div>
                  <div className="m">
                    <div className="k">RM impact</div>
                    <div className="v text-risk-500">{impact.toFixed(2)}</div>
                  </div>
                  <div className="m">
                    <div className="k">Order units</div>
                    <div className="v">{run.actions.reduce((s, a) => s + a.orderQty, 0)}</div>
                  </div>
                  <div className="m">
                    <div className="k">Savings</div>
                    <div className="v text-stock-500">{run.savingsPercent}%</div>
                  </div>
                </div>

                {/* At-risk lines live inside the summary → the stream stays append-only */}
                {needsAction.map((a) => (
                  <div
                    key={a.itemId}
                    className="flex items-center justify-between gap-3 border-t-[2px] border-cream-100 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-extrabold uppercase tracking-[-0.01em]">
                        {a.itemName}
                      </div>
                      <div className="truncate font-mono text-[10px] uppercase tracking-[0.05em] text-cream-300">
                        {a.action}
                      </div>
                    </div>
                    <span className={`price ${a.category === "expiry" ? "ok" : "risk"}`}>
                      RM {a.rmImpact.toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-3 border-t-[2px] border-cream-100 p-4">
                  <span className="tick min-w-[150px] flex-1">Backtest vs same-day-last-week baseline</span>
                  <button className="btn-primary" onClick={onSwitchToPlan}>
                    <i className="ph ph-clipboard-text" /> View order sheet
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className={`msg rise ${m.role === "user" ? "user" : ""}`}>
              <div className="who">
                <i className={`ph ${m.role === "user" ? "ph-user" : "ph-storefront"}`} />
                {m.role === "user" ? "You" : "Warung"}
              </div>
              <div className="whitespace-pre-wrap text-[13px]">{m.text}</div>
            </div>
          );
        })}

        {running && !streaming && (
          <div className="msg rise">
            <div className="who">
              <i className="ph ph-cpu" /> Warung
            </div>
            <div className="flex items-center gap-2 text-[13px] text-cream-300">
              <i className="ph ph-circle-notch animate-spin" /> Running agents…
            </div>
          </div>
        )}
      </div>

      {/* Suggestions — fixed above the composer */}
      <div className="flex flex-wrap gap-2 border-t-[2px] border-cream-100 bg-forest-800 px-4 pt-3 pb-1">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip-suggest" onClick={() => send(s)}>
            <i className="ph ph-play" />
            {s}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-3 border-t-[3px] border-cream-100 bg-forest-800 px-4 py-3">
        <input
          className="input-field flex-1"
          placeholder="Ask the warung"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
        />
        <button className="btn-primary" onClick={() => send(input)}>
          <i className="ph ph-paper-plane-tilt" /> Send
        </button>
      </div>
    </>
  );
}
