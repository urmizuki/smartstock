// Newsvendor model: cost-based order quantity
// Cu = price - cost (lost margin per unit of unmet demand)
// Co = cost (waste per unit of unsold stock)
// CR = Cu / (Cu + Co) — critical ratio
// q = demand quantile at CR (normal approximation)
// Order = max(0, round(q) - currentStock)

import { Item, ForecastResult, NewsvendorResult } from "./types";

function normalQuantile(p: number): number {
  // Inverse CDF of standard normal (approximation)
  // Beasley-Springer-Moro algorithm
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [
    -3.969683028665376e1, 2.209460927742389e2, -2.759285104469687e2,
    1.383577519089767e2, -3.066479804025509e1, 2.506628258841371e1,
  -5.353013672722413,
  ];
  const b = [
    -5.447609230285537e1, 1.615858655541339e2, -1.553618001979835e2,
    6.645614654095285e1, -1.134731335800735e1,
  ];
  const c = [
    -7.789106029722413e-3, -3.223951942220414e-1, -2.400754984636359e0,
    -2.549547521170993e0, 4.373180892355762e0, 2.938311686079684e0,
  ];
  const d = [7.789106029722413e-3, 3.223951942220414e-1,
    6.033815815942414e-1, 1.0,
  ];

  const plow = 0.02425;
  const phigh = 1 - plow;
  let q, r;

  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    r = c[0] + q * (c[1] + q * (c[2] + q * (c[3] + q * (c[4] + q * c[5]))));
    r = r / (d[0] + q * (d[1] + q * (d[2] + q * (d[3] + q * d[4]))));
  } else if (p <= phigh) {
    q = p - 0.5;
    r = q * q;
    r = a[0] + q * (a[1] + r * (a[2] + r * (a[3] + r * (a[4] + r * (a[5] + r * a[6])))));
    r = r / (b[0] + r * (b[1] + r * (b[2] + r * (b[3] + r * (b[4] + r * b[0])))));
    r = q * r;
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    r = c[0] + q * (c[1] + q * (c[2] + q * (c[3] + q * (c[4] + q * c[5]))));
    r = r / (d[0] + q * (d[1] + q * (d[2] + q * (d[3] + q * d[4]))));
    r = -r;
  }

  return r;
}

export function computeNewsvendor(
  item: Item,
  forecast: ForecastResult
): NewsvendorResult {
  const cu = item.price - item.cost; // understock cost
  const co = item.cost; // overstock cost
  const cr = cu / (cu + co); // critical ratio

  // q = mu + sd * z(CR)
  const z = normalQuantile(cr);
  const q = forecast.mu + forecast.sd * z;

  let orderQty = Math.max(0, Math.round(q) - item.stock);

  // Clip to supplier limit
  orderQty = Math.min(orderQty, item.supplierLimit);

  return {
    itemId: item.id,
    cu: Math.round(cu * 100) / 100,
    co: Math.round(co * 100) / 100,
    cr: Math.round(cr * 100) / 100,
    orderQty,
    expectedUnits: Math.round(forecast.mu),
  };
}

export function computeAllNewsvendor(
  items: Item[],
  forecasts: ForecastResult[]
): NewsvendorResult[] {
  return items.map((item) => {
    const fc = forecasts.find((f) => f.itemId === item.id)!;
    return computeNewsvendor(item, fc);
  });
}
