import SettingsClient from "./SettingsClient";
import { SESSIONS, CUSTOM_PRICING } from "@/data/sessions";
import { RENTAL_MODELS } from "@/data/rentals";
import { FLAVOURS } from "@/data/flavours";

export default function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 42, color: "var(--text-primary)", letterSpacing: "0.06em", lineHeight: 1 }}>SETTINGS</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>Manage sessions, pricing, rentals, and business configuration</p>
      </div>
      <SettingsClient sessions={SESSIONS} customPricing={CUSTOM_PRICING} rentals={RENTAL_MODELS} flavours={FLAVOURS} />
    </div>
  );
}
