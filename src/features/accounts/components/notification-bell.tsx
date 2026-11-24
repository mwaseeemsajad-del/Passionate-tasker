import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { markNotificationsRead } from "../actions";

type Note = { id: string; title: string; body: string; href: string; read_at: string | null; created_at: string };

/*
 * The bell on every dashboard: the latest notifications, newest first, written
 * by the database when a booking changes (migration 0010). A native
 * <details> opens it, so it works with a keyboard and screen reader and
 * without JavaScript. Updates on each page load, not live.
 */
export async function NotificationBell() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, href, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  const notes = (data ?? []) as Note[];
  const unread = notes.filter((n) => !n.read_at).length;

  return (
    <details className="group relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-full border border-line px-4 font-medium hover:border-ink lg:rounded-md [&::-webkit-details-marker]:hidden">
        <Bell aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.5} />
        Notifications
        {unread > 0 && (
          <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-sm font-semibold text-on-accent">
            {unread}
            <span className="sr-only"> new</span>
          </span>
        )}
      </summary>
      <div className="absolute left-0 z-20 mt-2 grid w-[min(22rem,calc(100vw-2rem))] gap-3 rounded-lg border border-line bg-paper p-4 shadow-lg">
        {notes.length === 0 ? (
          <p className="text-text-3">Nothing yet. Updates about your jobs show here.</p>
        ) : (
          <ul className="grid divide-y divide-line">
            {notes.map((n) => (
              <li key={n.id} className="py-3 first:pt-0">
                <Link href={n.href || "#"} className="grid gap-1 hover:underline">
                  <span className="font-semibold">
                    {!n.read_at && <span className="sr-only">New: </span>}
                    {!n.read_at && <span aria-hidden="true" className="mr-2 inline-block size-2 rounded-full bg-accent align-middle" />}
                    {n.title}
                  </span>
                  <span className="text-sm text-text-2">{n.body}</span>
                  <span className="text-sm text-text-3">
                    {new Date(n.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {unread > 0 && (
          <form action={markNotificationsRead}>
            <button type="submit" className="min-h-11 cursor-pointer font-semibold underline underline-offset-4">
              Mark all as read
            </button>
          </form>
        )}
      </div>
    </details>
  );
}
