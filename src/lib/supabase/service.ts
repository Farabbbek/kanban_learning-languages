import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. Only use in API routes for admin operations.
 * NEVER expose this to the browser.
 */
let serviceClient: ReturnType<typeof createClient> | null = null;

export function getServiceClient() {
  if (!serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!key) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    serviceClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return serviceClient;
}
