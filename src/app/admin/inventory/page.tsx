"use client";

import { useState, useEffect, useRef } from "react";
import { FLAVOURS } from "@/data/flavours";

interface InventoryRow {
  id: string;
  flavour_id: string;
  stock_50g: number;
  stock_100g: number;
  stock_250g: number;
  updated_at: string;
}

type StockSize = "stock_50g" | "stock_100g" | "stock_250g";

interface EditingCell {
  flavour_id: string;
  field: StockSize;
  value: string;
}

function stockColor(qty: number): string {
  if (qty === 0) return "#ef4444";
  if (qty <= 20) return "var(--gold)";
  return "#22c55e";
}

function stockLabel(qty: number): string {
  if (qty === 0) return "out";
  if (qty <= 20) return "low";
  return "ok";
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [lowFilter, setLowFilter] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const json = await res.json() as { inventory: InventoryRow[] };
        setInventory(json.inventory ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadInventory(); }, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function getStock(flavourId: string): InventoryRow | undefined {
    return inventory.find((i) => i.flavour_id === String(flavourId));
  }

  function startEdit(flavour_id: string, field: StockSize, currentVal: number) {
    setEditing({ flavour_id, field, value: String(currentVal) });
  }

  async function commitEdit() {
    if (!editing) return;
    const current = getStock(editing.flavour_id);
    const newVal = parseInt(editing.value, 10);
    if (isNaN(newVal) || newVal < 0) {
      setEditing(null);
      return;
    }

    const payload = {
      flavour_id: editing.flavour_id,
      stock_50g: current?.stock_50g ?? 0,
      stock_100g: current?.stock_100g ?? 0,
      stock_250g: current?.stock_250g ?? 0,
      [editing.field]: newVal,
    };

    setSaving(`${editing.flavour_id}-${editing.field}`);
    setEditing(null);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json() as { inventory: InventoryRow };
        setInventory((prev) => {
          const idx = prev.findIndex((i) => i.flavour_id === editing.flavour_id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = json.inventory;
            return next;
          }
          return [...prev, json.inventory];
        });
      }
    } finally {
      setSaving(null);
    }
  }

  const visibleFlavours = lowFilter
    ? FLAVOURS.filter((f) => {
        const inv = getStock(String(f.id));
        return (inv?.stock_50g ?? 0) <= 20 || (inv?.stock_100g ?? 0) <= 20 || (inv?.stock_250g ?? 0) <= 20;
      })
    : FLAVOURS;

  const SIZE_FIELDS: { key: StockSize; label: string }[] = [
    { key: "stock_50g", label: "50g" },
    { key: "stock_100g", label: "100g" },
    { key: "stock_250g", label: "250g" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: 40,
            color: "var(--text-primary)",
            letterSpacing: "0.06em",
            lineHeight: 1,
          }}>
            INVENTORY
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            {visibleFlavours.length} flavour{visibleFlavours.length !== 1 ? "s" : ""} · Click a stock number to edit
          </p>
        </div>
        <button
          onClick={() => setLowFilter(!lowFilter)}
          style={{
            padding: "10px 20px",
            minHeight: 44,
            background: lowFilter ? "var(--gold)" : "transparent",
            color: lowFilter ? "#05030a" : "var(--gold)",
            border: `1px solid var(--gold)`,
            borderRadius: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {lowFilter ? "⚠ LOW STOCK ONLY" : "Show low stock"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--text-muted)", fontSize: 14 }}>Loading inventory...</div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, calc(50% - 8px)), 1fr))",
          gap: 12,
        }}>
          {visibleFlavours.map((flavour) => {
            const inv = getStock(String(flavour.id));

            return (
              <div
                key={flavour.id}
                style={{
                  background: "var(--nebula)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 12,
                  padding: 16,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Colour accent */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: flavour.color,
                  borderRadius: "12px 12px 0 0",
                }} />

                {/* Title row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>{flavour.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{flavour.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{flavour.category}</div>
                  </div>
                </div>

                {/* Stock cells */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {SIZE_FIELDS.map(({ key, label }) => {
                    const currentVal = inv?.[key] ?? 0;
                    const isEditing = editing?.flavour_id === String(flavour.id) && editing?.field === key;
                    const isSaving = saving === `${flavour.id}-${key}`;
                    const color = stockColor(currentVal);

                    return (
                      <div key={key} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                          {label}
                        </div>
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            type="number"
                            min={0}
                            value={editing.value}
                            onChange={(e) => setEditing((prev) => prev ? { ...prev, value: e.target.value } : prev)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(null); }}
                            style={{
                              width: "100%",
                              minHeight: 36,
                              background: "rgba(255,255,255,0.06)",
                              border: `1px solid ${color}`,
                              borderRadius: 6,
                              textAlign: "center",
                              color: color,
                              fontSize: 16,
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                              outline: "none",
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => startEdit(String(flavour.id), key, currentVal)}
                            disabled={isSaving}
                            title={`Click to edit ${label} stock`}
                            style={{
                              width: "100%",
                              minHeight: 44,
                              background: `${color}12`,
                              border: `1px solid ${color}44`,
                              borderRadius: 6,
                              color: color,
                              fontSize: 18,
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <span>{isSaving ? "…" : currentVal}</span>
                            <span style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.7 }}>
                              {stockLabel(currentVal)}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
