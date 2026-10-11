# SmartStock — Inventory Loss Predictor

SmartStock is an agentic inventory-loss predictor for small campus canteens and food businesses in Malaysia. It turns one plain-language prompt ("Plan for tomorrow") into a ranked, validated morning action plan: what to restock, what to mark down before expiry, and what to skip — all quantified in ringgit.

## The problem

Small canteens and food stalls lose money every morning because they:

- **Over-prep** — no demand signal, so unsold trays pile up by 11 a.m.
- **Miss markdowns** — near-expiry items get thrown out instead of discounted in time.
- **Decide on a hunch** — owners guess at 5 a.m. with no data, then lose 15–25% of food to waste every week.

## What SmartStock solves

SmartStock replaces guesswork with one-click decisions backed by data:

- **One prompt → one plan** — a multi-agent pipeline (Planner → Demand → Expiry → Context → Validator) decomposes the goal, forecasts demand, flags expiry, and validates constraints automatically.
- **Ranked, money-first actions** — every action shows exactly how much ringgit it saves, with plain-language reasons and an expandable forecast chart.
- **Built-in validation** — a validator agent rejects impossible plans; outputs are structured, numbered, and immediately usable (restock quantities, discount percentages, supplier message text).
- **Context-aware** — reacts to payday, rain, and holidays.
- **Backtested proof** — savings quantified against a same-day-last-week baseline on synthetic sample sales data.
- **Production-ready rollout** — each canteen connects via a store PIN and uploads a daily CSV from their POS.

## Built for

WorkBuddy Agentic Solutions track · campus canteens → any small food retailer.