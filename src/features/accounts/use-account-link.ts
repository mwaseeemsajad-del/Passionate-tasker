"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";
import type { Role } from "@/types/accounts";

export type AccountLink = { label: string; href: string; signedIn: boolean };

const SIGNED_OUT: AccountLink = { label: "Log in", href: "/login", signedIn: false };
const FOR_ROLE: Record<Role, AccountLink> = {
  provider: { label: "Dashboard", href: "/provider", signedIn: true },
  customer: { label: "My bookings", href: "/account", signedIn: true },
  admin: { label: "Team", href: "/admin", signedIn: true },
};

/*
 * Where the header's account button goes: Log in, or the signed-in person's
 * dashboard. Read in the browser, so every public page stays static; the
 * dashboards themselves check the session on the server.
 */
export function useAccountLink(): AccountLink {
  const [link, setLink] = useState<AccountLink>(SIGNED_OUT);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    let alive = true;

    const load = async (userId: string | undefined) => {
      if (!userId) return alive && setLink(SIGNED_OUT);
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (alive) setLink(FOR_ROLE[(data?.role as Role) ?? "customer"] ?? SIGNED_OUT);
    };

    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user.id);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return link;
}
