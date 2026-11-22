import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase"; // Your existing CRM Firebase client config

function formatPreferences(prefs) {
  if (!prefs) return "—";
  if (typeof prefs === "string") return prefs;
  if (typeof prefs === "object") {
    return [prefs.hobbyFocus, prefs.fulfillmentMethod, prefs.edition]
      .filter(Boolean)
      .join(" • ") || "—";
  }
  return String(prefs);
}

export default function VaultSubmissionsTab() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" | "paid" | "pending"

  useEffect(() => {
    const q = query(
      collection(db, "vault_submissions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setSubmissions(items);
    });

    return () => unsubscribe();
  }, []);

  const toggleFulfilled = async (id, currentStatus) => {
    await updateDoc(doc(db, "vault_submissions", id), {
      fulfilled: !currentStatus,
    });
  };

  const filtered = submissions.filter((item) => {
    if (filter === "all") return true;
    return item.paymentStatus === filter;
  });

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-amber-400">
            ECQ Vault Submissions
          </h2>
          <p className="text-sm text-slate-400">
            Live intake synced with Square payments
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {["all", "paid", "pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                filter === tab
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-xs">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Tier / Selection</th>
              <th className="py-3 px-4">Notes / Preferences</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                  {sub.createdAt?.toDate
                    ? sub.createdAt.toDate().toLocaleDateString()
                    : "Just now"}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">
                    {sub.customerName}
                  </div>
                  <div className="text-xs text-slate-400">{sub.email}</div>
                  {sub.phone && (
                    <div className="text-xs text-slate-400">{sub.phone}</div>
                  )}
                </td>
                <td className="py-3 px-4 font-medium text-amber-300">
                  {sub.tier || "Standard"}
                  {sub.amountPaid ? ` ($${sub.amountPaid})` : ""}
                </td>
                <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                  {formatPreferences(sub.preferences)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sub.paymentStatus === "paid"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {sub.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => toggleFulfilled(sub.id, sub.fulfilled)}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      sub.fulfilled
                        ? "bg-slate-700 text-slate-300"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {sub.fulfilled ? "Fulfilled ✓" : "Mark Shipped"}
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-slate-500 italic"
                >
                  No submissions found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
