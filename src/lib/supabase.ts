/**
 * Supabase client helpers
 *
 * createClient()        — browser-safe, uses ANON key (respects RLS)
 * createServiceClient() — server-only, uses SERVICE_ROLE key (bypasses RLS)
 *
 * Do NOT import createServiceClient() in any Client Component or
 * any file that gets bundled for the browser.
 *
 * NOTE: Requires @supabase/supabase-js — install with:
 *   npm install @supabase/supabase-js
 */

// ---------------------------------------------------------------------------
// Env vars
// ---------------------------------------------------------------------------

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Database type definitions
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          name: string;
          phone: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at"> &
          Partial<Pick<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          created_at: string;
          customer_id: string;
          status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
          total_kobo: number;
          delivery_address: string;
          paystack_reference: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at"> &
          Partial<Pick<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          created_at: string;
          order_id: string;
          flavour_id: string;
          size: "50g" | "100g" | "250g";
          quantity: number;
          unit_price_kobo: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id" | "created_at"> &
          Partial<Pick<Database["public"]["Tables"]["order_items"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          created_at: string;
          customer_id: string;
          session_id: string;
          session_name: string;
          booking_date: string;
          time_slot: string;
          status: "pending" | "confirmed" | "cancelled" | "completed";
          total_kobo: number;
          paystack_reference: string | null;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at"> &
          Partial<Pick<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      booking_flavours: {
        Row: {
          id: string;
          created_at: string;
          booking_id: string;
          flavour_id: string;
          quantity: number;
        };
        Insert: Omit<Database["public"]["Tables"]["booking_flavours"]["Row"], "id" | "created_at"> &
          Partial<Pick<Database["public"]["Tables"]["booking_flavours"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["booking_flavours"]["Insert"]>;
      };
      inventory: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          flavour_id: string;
          stock_50g: number;
          stock_100g: number;
          stock_250g: number;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory"]["Row"], "id" | "created_at"> &
          Partial<Pick<Database["public"]["Tables"]["inventory"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      delivery_events: {
        Row: {
          id: string;
          created_at: string;
          order_id: string;
          status: string;
          description: string;
          location: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["delivery_events"]["Row"], "id" | "created_at"> &
          Partial<Pick<Database["public"]["Tables"]["delivery_events"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["delivery_events"]["Insert"]>;
      };
    };
  };
}

// ---------------------------------------------------------------------------
// Minimal type shim — lets this file compile before @supabase/supabase-js
// is installed. The real SupabaseClient from the package is compatible with
// these shapes; once installed the import below takes precedence.
// ---------------------------------------------------------------------------

type SupabaseClientOptions = {
  auth?: { persistSession?: boolean; autoRefreshToken?: boolean };
};

// Attempt to use the real package if available; otherwise fall back to a
// runtime stub that throws a helpful error.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

function buildClient(url: string, key: string, options?: SupabaseClientOptions): AnySupabaseClient {
  // Dynamic require so TypeScript doesn't error on a missing module at compile time.
  // When the package is installed this resolves normally; otherwise the error is
  // thrown at runtime with a clear message.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  let factory: ((u: string, k: string, o?: SupabaseClientOptions) => AnySupabaseClient) | undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    factory = (require("@supabase/supabase-js") as { createClient: typeof factory }).createClient;
  } catch {
    throw new Error(
      "Supabase client not available. Run: npm install @supabase/supabase-js"
    );
  }
  if (!factory) throw new Error("createClient not found in @supabase/supabase-js");
  return factory(url, key, options);
}

// ---------------------------------------------------------------------------
// Client factories
// ---------------------------------------------------------------------------

/**
 * Browser-safe Supabase client using the anon key.
 * RLS policies apply — users can only access their own data.
 * Safe to call from Client Components and Server Components alike.
 */
export function createClient(): AnySupabaseClient {
  return buildClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false } }
  );
}

/**
 * Server-only Supabase client using the service role key.
 * Bypasses RLS — use ONLY in Route Handlers and Server Actions.
 * Never expose this client to the browser bundle.
 */
export function createServiceClient(): AnySupabaseClient {
  return buildClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
