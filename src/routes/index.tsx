import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, TrendingUp, Inbox } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TransactionItem } from "@/components/TransactionItem";
import { formatCurrency, useTransactions } from "@/lib/transactions";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { transactions, totals } = useTransactions();
  const recent = transactions.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const monthDelta = 2.4;

  return (
    <AppShell>
      <section className="balance-block">
        <div className="balance-label">Total Balance</div>
        <div className="balance-amount">{formatCurrency(totals.balance)}</div>
        <div className={`balance-meta ${monthDelta >= 0 ? "up" : "down"}`}>
          <TrendingUp size={12} /> +{monthDelta}% this month
        </div>
      </section>

      <section className="summary-row">
        <div className="summary-card">
          <div className="label"><ArrowDown size={12} className="arrow in" /> Income</div>
          <div className="value">{formatCurrency(totals.income)}</div>
        </div>
        <div className="summary-card active">
          <div className="label"><ArrowUp size={12} className="arrow out" /> Expenses</div>
          <div className="value">{formatCurrency(totals.expense)}</div>
        </div>
      </section>

      <Link to="/analytics" className="analytics-banner-link">
        <section className="analytics-banner">
          <h3>Spend Analytics</h3>
          <p>You spent 12% less on dining this week.</p>
        </section>
      </Link>

      <div className="section-head">
        <h2>Recent Activity</h2>
        <Link to="/transactions">View All</Link>
      </div>

      {recent.length === 0 ? (
        <div className="empty">
          <Inbox size={36} className="icon" />
          <h3>No transactions yet</h3>
          <p>Add your first transaction to get started.</p>
        </div>
      ) : (
        <div className="txn-card">
          {recent.map((t) => (
            <TransactionItem key={t.id} tx={t} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
