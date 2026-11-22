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

export default function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "subscribed" | "unsubscribed"

  useEffect(() => {
    const q = query(
      collection(db, "customers"),
      orderBy("lastOrderAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setCustomers(list);
    });

    return () => unsubscribe();
  }, []);

  const toggleSubscription = async (emailId, currentStatus) => {
    await updateDoc(doc(db, "customers", emailId), {
      newsletterSubscribed: !currentStatus,
    });
  };

  const filtered = customers.filter((c) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "subscribed"
        ? c.newsletterSubscribed === true
        : c.newsletterSubscribed !== true;

    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      c.customerName?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.favoriteCategory?.toLowerCase().includes(term) ||
      c.phone?.includes(term);

    return matchesFilter && matchesSearch;
  });

  // One-click CSV export for email/SMS marketing tools
  const exportNewsletterCsv = () => {
    const subscribers = customers.filter((c) => c.newsletterSubscribed);
    if (subscribers.length === 0) {
      alert("No subscribed customers to export yet.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Favorite Focus",
      "Last Tier Ordered",
      "Total Orders",
      "Total Spent ($)",
    ];

    const rows = subscribers.map((c) => [
      `"${(c.customerName || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.favoriteCategory || "").replace(/"/g, '""')}"`,
      `"${(c.lastOrderTier || "").replace(/"/g, '""')}"`,
      c.totalOrders || 1,
      c.totalSpent || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ecq-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const subscribedCount = customers.filter((c) => c.newsletterSubscribed).length;

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400">
            ECQ Customer Directory & Newsletter List
          </h2>
          <p className="text-sm text-slate-400">
            {customers.length} total customers ·{" "}
            <span className="text-emerald-400 font-medium">
              {subscribedCount} opted into newsletter & VIP drop alerts
            </span>
          </p>
        </div>

        <button
          onClick={exportNewsletterCsv}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition"
        >
          Export Subscribed CSV ({subscribedCount})
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search name, email, phone, or PC focus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400"
        />

        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "subscribed", label: "Subscribed" },
            { key: "unsubscribed", label: "Opted Out" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                filter === tab.key
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-xs">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">PC / Focus</th>
              <th className="py-3 px-4">Last Tier</th>
              <th className="py-3 px-4">Orders / Spent</th>
              <th className="py-3 px-4 text-right">Newsletter Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {filtered.map((cust) => (
              <tr key={cust.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4">
                  <div className="font-semibold text-white">
                    {cust.customerName || "Unknown"}
                  </div>
                  <div className="text-xs text-slate-400">{cust.email}</div>
                  {cust.phone && (
                    <div className="text-xs text-slate-400">{cust.phone}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {cust.favoriteCategory || "—"}
                </td>
                <td className="py-3 px-4 text-amber-300 font-medium">
                  {cust.lastOrderTier || "—"}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  <span className="font-semibold text-white">
                    {cust.totalOrders || 1}
                  </span>{" "}
                  order{(cust.totalOrders || 1) > 1 ? "s" : ""} ·{" "}
                  <span className="text-emerald-400 font-semibold">
                    ${cust.totalSpent || 0}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() =>
                      toggleSubscription(cust.id, cust.newsletterSubscribed)
                    }
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      cust.newsletterSubscribed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {cust.newsletterSubscribed ? "Subscribed ✓" : "Opted Out"}
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-slate-500 italic"
                >
                  No customers match this filter yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
