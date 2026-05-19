import { useState } from "react";
import { getCategory } from "@/lib/categories";
import { formatCurrency, useTransactions, type Transaction } from "@/lib/transactions";
import { Link } from "@tanstack/react-router";

export function TransactionItem({ tx, showDate = true, expandable = false }: { tx: Transaction; showDate?: boolean; expandable?: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { remove } = useTransactions();
  const cat = getCategory(tx.category);
  const Icon = cat.icon;
  const d = new Date(tx.date);
  const dateLabel = d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }).toUpperCase();

  return (
    <div>
      <button
        type="button"
        onClick={() => expandable && setOpen((o) => !o)}
        className="txn-row"
        style={{ width: "100%", background: "transparent", border: "none", textAlign: "left" }}
      >
        <div className="txn-icon"><Icon size={18} /></div>
        <div className="txn-meta">
          <div className="name">{tx.merchant || cat.name}</div>
          <div className="cat">{cat.name}{tx.note ? ` · ${tx.note}` : ""}</div>
        </div>
        <div className="txn-amt">
          <div className={`v ${tx.type === "income" ? "in" : "out"}`}>
            {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
          </div>
          {showDate && <div className="d">{dateLabel}</div>}
        </div>
      </button>
      {expandable && open && (
        <div className="txn-actions">
          <Link to="/add" search={{ id: tx.id }}>
            <button type="button" style={{ width: "100%" }}>Edit</button>
          </Link>
          <button type="button" className="danger" onClick={() => setConfirm(true)}>Delete</button>
        </div>
      )}
      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete transaction?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setConfirm(false)}>Cancel</button>
              <button className="danger" onClick={() => { remove(tx.id); setConfirm(false); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}