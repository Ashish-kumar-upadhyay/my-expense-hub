import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Inbox } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell as BarCell } from "recharts";
import { AppShell } from "@/components/AppShell";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { formatCurrency, useTransactions } from "@/lib/transactions";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function monthLabel(d: Date) { return d.toLocaleDateString("en-US", { month: "long", year: "numeric" }); }

function AnalyticsPage() {
  const { transactions } = useTransactions();
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const cursorKey = monthKey(cursor);
  const prevMonth = useMemo(() => { const d = new Date(cursor); d.setMonth(d.getMonth() - 1); return d; }, [cursor]);
  const prevKey = monthKey(prevMonth);

  const monthTxs = transactions.filter((t) => t.type === "expense" && t.date.startsWith(cursorKey));
  const prevMonthTotal = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(prevKey))
    .reduce((s, t) => s + t.amount, 0);
  const total = monthTxs.reduce((s, t) => s + t.amount, 0);

  const byCat = CATEGORIES.filter((c) => c.id !== "income").map((c) => {
    const sum = monthTxs.filter((t) => t.category === c.id).reduce((s, t) => s + t.amount, 0);
    return { ...c, value: sum, pct: total ? (sum / total) * 100 : 0 };
  }).filter((c) => c.value > 0).sort((a, b) => b.value - a.value);

  const topCat = byCat[0];

  const delta = prevMonthTotal ? ((total - prevMonthTotal) / prevMonthTotal) * 100 : 0;

  // 6-month trend
  const trend = useMemo(() => {
    const out: { label: string; key: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cursor); d.setMonth(d.getMonth() - i);
      const k = monthKey(d);
      const t = transactions.filter((x) => x.type === "expense" && x.date.startsWith(k)).reduce((s, t) => s + t.amount, 0);
      out.push({ label: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(), key: k, total: t });
    }
    return out;
  }, [transactions, cursor]);

  return (
    <AppShell>
      <div className="period-nav">
        <button onClick={() => { const d = new Date(cursor); d.setMonth(d.getMonth() - 1); setCursor(d); }} aria-label="Previous">
          <ChevronLeft size={20} />
        </button>
        <div className="center">
          <div className="lbl">Current Period</div>
          <div className="pd">{monthLabel(cursor)}</div>
        </div>
        <button onClick={() => { const d = new Date(cursor); d.setMonth(d.getMonth() + 1); setCursor(d); }} aria-label="Next">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="exp-card">
        <div>
          <div className="lbl">Total Expenditure</div>
          <div className="v">{formatCurrency(total)}</div>
        </div>
        {prevMonthTotal > 0 && (
          <div className={`delta ${delta > 0 ? "up" : ""}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta).toFixed(0)}% {delta > 0 ? "more" : "less"} than {prevMonth.toLocaleDateString("en-US", { month: "long" })}
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="empty">
          <Inbox size={36} className="icon" />
          <h3>No expenses this month</h3>
          <p>Add an expense to see your breakdown.</p>
        </div>
      ) : (
        <>
          <div className="analytics-grid">
            <div className="donut-card">
              <div className="lbl">Spending Breakdown</div>
              <div style={{ width: "100%", height: 200, position: "relative" }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={byCat}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {byCat.map((c) => <Cell key={c.id} fill={c.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {topCat && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 26 }}>{topCat.pct.toFixed(0)}%</div>
                    <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase" }}>{topCat.name}</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="cat-list">
                {byCat.slice(0, 4).map((c) => (
                  <div key={c.id} className="cat-row">
                    <div className="cat-swatch" style={{ background: c.color }} />
                    <div className="nm">{c.name}</div>
                    <div className="amt">
                      <div className="v">{formatCurrency(c.value)}</div>
                      <div className="pct">{c.pct.toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="detailed-btn">View Detailed Report</button>
            </div>
          </div>

          <div className="trend-section">
            <h3>6-Month Trend</h3>
            <div className="trend-card">
              <div style={{ width: "100%", height: 140 }}>
                <ResponsiveContainer>
                  <BarChart data={trend} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ background: "#0a0a0a", border: "none", borderRadius: 6, fontSize: 11, color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#8a8a8a" }} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {trend.map((t) => (
                        <BarCell key={t.key} fill={t.key === cursorKey ? "#0a0a0a" : "#d8d8d8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}