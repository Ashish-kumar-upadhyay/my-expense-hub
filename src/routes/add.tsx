import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { X, Calendar, FileText } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { useTransactions, type TxType } from "@/lib/transactions";
import avatarUrl from "@/assets/avatar.jpg";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/add")({
  validateSearch: searchSchema,
  component: AddPage,
});

function AddPage() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const { transactions, add, update } = useTransactions();
  const editing = id ? transactions.find((t) => t.id === id) : undefined;

  const [type, setType] = useState<TxType>(editing?.type ?? "expense");
  const [amount, setAmount] = useState<string>(editing ? String(editing.amount) : "");
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? "shopping");
  const [date, setDate] = useState<string>(editing?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>(editing?.note ?? "");
  const [merchant, setMerchant] = useState<string>(editing?.merchant ?? "");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (type === "income" && category !== "income") setCategory("income");
    if (type === "expense" && category === "income") setCategory("shopping");
  }, [type, category]);

  const expenseCats = CATEGORIES.filter((c) => c.id !== "income");

  const onSave = () => {
    const n = parseFloat(amount);
    if (!amount || isNaN(n) || n <= 0) { setError("Please enter a valid amount."); return; }
    if (!merchant.trim()) { setError("Please enter a description / merchant."); return; }
    const payload = { type, amount: n, category, date, note: note.trim(), merchant: merchant.trim() };
    if (editing) update(editing.id, payload);
    else add(payload);
    navigate({ to: "/transactions" });
  };

  const dateLabel = (() => {
    const d = new Date(date);
    const today = new Date().toISOString().slice(0, 10);
    const prefix = date === today ? "Today, " : "";
    return prefix + d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  })();

  return (
    <AppShell
      header={
        <header className="add-header">
          <div className="title">
            <Link to="/transactions" className="icon-btn" aria-label="Close"><X size={20} /></Link>
            <span>{editing ? "Edit Transaction" : "Add Transaction"}</span>
          </div>
          <div className="avatar" aria-label="Profile">
            <img src={avatarUrl} alt="Profile" width={36} height={36} loading="lazy" />
          </div>
        </header>
      }
    >
      <div className="tt-toggle">
        <button className={type === "expense" ? "active" : ""} onClick={() => setType("expense")}>Expense</button>
        <button className={type === "income" ? "active" : ""} onClick={() => setType("income")}>Income</button>
      </div>

      <div className="amount-block">
        <div className="lbl">Amount</div>
        <div className="amount-input">
          <span>$</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }}
          />
        </div>
      </div>

      {type === "expense" && (
        <>
          <div className="field-label">Category</div>
          <div className="cat-grid">
            {expenseCats.map((c) => {
              const Icon = c.icon;
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`cat-tile ${active ? "active" : ""}`}
                  onClick={() => setCategory(c.id)}
                >
                  <div className="ic"><Icon size={18} /></div>
                  <div className="nm">{c.name}</div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="field-label">Description</div>
      <div className="field-input">
        <input
          placeholder="e.g. Whole Foods"
          value={merchant}
          onChange={(e) => { setMerchant(e.target.value); setError(""); }}
          maxLength={80}
        />
      </div>

      <div className="field-label">Date</div>
      <div className="field-input">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ flex: 1 }}
        />
        <Calendar size={16} color="#8a8a8a" />
      </div>
      <div style={{ fontSize: 12, color: "#8a8a8a", margin: "-12px 20px 16px" }}>{dateLabel}</div>

      <div className="field-label">Note</div>
      <div className="field-input">
        <input
          placeholder="Add a description..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={140}
        />
        <FileText size={16} color="#8a8a8a" />
      </div>

      {error && <div className="field-error">{error}</div>}

      <button className="save-btn" onClick={onSave}>
        {editing ? "Update Transaction" : "Save Transaction"}
      </button>
    </AppShell>
  );
}