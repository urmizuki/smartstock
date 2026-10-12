import { SAMPLE_ITEMS } from "../lib/sample-data";

const SUPPLIERS: Record<string, string> = {
  "nasi-lemak": "Makcik Kitchen Sdn Bhd",
  "teh-tarik": "Beverage Supply Co.",
  "mee-goreng": "Makcik Kitchen Sdn Bhd",
  karipap: "Snack Distributors",
  "sandwich-tuna": "FreshBites Supply",
  "kuih-lapis": "Kuih Express",
};

const ICONS: Record<string, string> = {
  "nasi-lemak": "ph-bowl-food",
  "teh-tarik": "ph-coffee",
  "mee-goreng": "ph-bowl-food",
  karipap: "ph-cookie",
  "sandwich-tuna": "ph-bread",
  "kuih-lapis": "ph-cake",
};

const CODES: Record<string, string> = {
  "nasi-lemak": "MEL-01",
  "teh-tarik": "DRK-02",
  "mee-goreng": "MEL-03",
  karipap: "SNK-04",
  "sandwich-tuna": "MEL-05",
  "kuih-lapis": "SNK-06",
};

export default function InventoryTab() {
  return (
    <div className="scroll-area min-h-0 flex-1 overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        <div className="special rise">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-500">
            Menu · {SAMPLE_ITEMS.length} dishes · Mon 12 Oct
          </div>
          <h1 className="macro mt-2 text-[clamp(30px,6vw,52px)]">Today's menu</h1>
          <p className="mt-3 max-w-[52ch] text-[13px]">
            Everything on the shelf right now — stock on hand, price, cost and margin per dish.
          </p>
        </div>

        <div className="rise grid grid-cols-1 gap-[3px] border-[3px] border-cream-100 bg-cream-100 shadow-pop min-[640px]:grid-cols-2 min-[1040px]:grid-cols-3">
          {SAMPLE_ITEMS.map((item) => {
            const isOut = item.stock === 0;
            const isMarkdown = !!item.expiry;
            const price = item.expiry ? item.price * (1 - item.expiry.discount) : item.price;
            return (
              <article key={item.id} className="dish">
                <div className="hd">
                  <span className="code">
                    <i className={`ph ${ICONS[item.id] ?? "ph-bowl-food"}`} />
                    {CODES[item.id]}
                  </span>
                  {isOut ? (
                    <span className="stamp out">
                      <i className="ph ph-warning" /> Sold out
                    </span>
                  ) : isMarkdown ? (
                    <span className="stamp warn">
                      <i className="ph ph-tag" /> Markdown
                    </span>
                  ) : (
                    <span className="stamp ok">
                      <i className="ph ph-check" /> Healthy
                    </span>
                  )}
                </div>
                <div>
                  <div className="nm">{item.name}</div>
                  <div className="sup">{SUPPLIERS[item.id]}</div>
                </div>
                <div className={`qty ${isOut ? "out" : ""}`}>
                  <span className="n">{String(item.stock).padStart(2, "0")}</span>
                  <span className="u">on shelf</span>
                </div>
                <div className="ft">
                  <span className={`price ${isMarkdown ? "warn" : ""}`}>RM {price.toFixed(2)}</span>
                  <span className="lbl">
                    {isOut ? `Order ${item.supplierLimit} in plan` : `Margin RM ${(item.price - item.cost).toFixed(2)}`}
                  </span>
                </div>
                {item.expiry && (
                  <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-cream-300">
                    Expires {item.expiry.date.slice(5)}
                    {item.expiry.hour ? ` ${item.expiry.hour}:00` : ""}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
