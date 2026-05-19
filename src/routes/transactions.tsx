import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Inbox } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TransactionItem } from "@/components/TransactionItem";
import { groupByDate, useTransactions } from "@/lib/transactions";
import { FILTER_CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const { transactions } = useTransactions();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filter !== "all" && t.category !== filter) return false;
      if (q && !`${t.merchant} ${t.note} ${t.category}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [transactions, q, filter]);

  const groups = groupByDate(filtered);

  return (
    <AppShell>
      <div className="search-bar">
        <Search size={16} />
        <input
          placeholder="Search transactions"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="chips">
        {FILTER_CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${filter === c ? "active" : ""}`}
            onClick={() => setFilter(c)}
          >
            {c[0].toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="empty">
          <Inbox size={36} className="icon" />
          <h3>No transactions found</h3>
          <p>Try changing your filter or search.</p>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.date}>
            <div className="date-group-label">{g.label}</div>
            <div className="txn-card">
              {g.items.map((t) => (
                <TransactionItem key={t.id} tx={t} showDate={false} expandable />
              ))}
            </div>
          </div>
        ))
      )}
    </AppShell>
  );
}