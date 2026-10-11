import { motion } from "framer-motion";
import { SAMPLE_ITEMS } from "../lib/sample-data";
import { InventoryIcon, PinIcon, UploadIcon } from "./icons";

const SUPPLIERS: Record<string, string> = {
  "nasi-lemak": "Makcik Kitchen Sdn Bhd",
  "teh-tarik": "Beverage Supply Co.",
  "mee-goreng": "Makcik Kitchen Sdn Bhd",
  "karipap": "Snack Distributors",
  "sandwich-tuna": "FreshBites Supply",
  "kuih-lapis": "Kuih Express",
};

export default function InventoryTab() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-elevated p-4 sm:p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
              <PinIcon className="w-5 h-5 text-cream-100" />
            </div>
            <div>
              <p className="text-sm font-bold text-cream-100">Oreo · UPM</p>
              <p className="text-xs text-cream-300/70">Store PIN: DEMO-UPM-001 · Sample data loaded</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-cream-300/70">
            <UploadIcon className="w-4 h-4" />
            <span>In production: upload CSV via PIN portal</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-elevated p-6 shine-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lift">
            <InventoryIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-cream-100 text-xl font-bold">Current stock</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="surface-card p-4 pop-card cursor-default"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-cream-100 font-semibold">{item.name}</h3>
                  <p className="text-xs text-cream-300/50">{SUPPLIERS[item.id]}</p>
                </div>
                <span className={`badge ${
                  item.category === "main" ? "badge-ok" :
                  item.category === "drink" ? "badge-stockout" : "badge-expiry"
                }`}>
                  {item.category}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-forest-700/40 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-cream-300/60 uppercase font-bold">Stock</p>
                  <p className="text-lg font-bold text-cream-100">{item.stock}</p>
                </div>
                <div className="bg-forest-700/40 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-cream-300/60 uppercase font-bold">Price</p>
                  <p className="text-sm font-semibold text-cream-200">RM{item.price.toFixed(2)}</p>
                </div>
                <div className="bg-forest-700/40 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-cream-300/60 uppercase font-bold">Cost</p>
                  <p className="text-sm font-semibold text-cream-300/70">RM{item.cost.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-sage-400/10 flex items-center justify-between text-xs">
                <span className="text-cream-300/50">Limit: {item.supplierLimit} units</span>
                <span className="text-gold-600 font-bold">Margin RM{(item.price - item.cost).toFixed(2)}</span>
              </div>

              {item.expiry && (
                <div className="mt-2">
                  <span className="badge badge-expiry animate-pulse-soft">
                    Expires {item.expiry.date.slice(5)}{item.expiry.hour ? ` ${item.expiry.hour}:00` : ""}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
