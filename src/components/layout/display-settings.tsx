"use client";

import { Eye } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Switch } from "@/components/ui/switch";
import { getServerSnapshot, getSnapshot, setHighContrast, setLargeText, subscribe } from "@/lib/display-prefs";
import { cn } from "@/lib/cn";

/** The two display settings. Used in the header menu and on the accessibility page. */
export function DisplayToggles({ idPrefix }: { idPrefix: string }) {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <div className="grid gap-5">
      <Switch
        id={`${idPrefix}-text`}
        label="Larger text"
        description="Makes all text and buttons a quarter bigger."
        checked={prefs.largeText}
        onChange={setLargeText}
      />
      <Switch
        id={`${idPrefix}-contrast`}
        label="High contrast"
        description="Black text, solid borders and stronger outlines."
        checked={prefs.highContrast}
        onChange={setHighContrast}
      />
    </div>
  );
}

/*
 * "Display" button in the header that opens the settings. Not a modal: the
 * page stays usable, Escape closes it and returns focus to the button.
 */
export function DisplayMenu({ bordered = false }: { bordered?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-base font-medium text-ink",
          bordered && "border border-line",
        )}
      >
        <Eye aria-hidden="true" className="size-5" strokeWidth={1.5} />
        Display
      </button>
      <div
        id={panelId}
        hidden={!open}
        role="group"
        aria-label="Display settings"
        className="absolute top-[calc(100%+12px)] right-0 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-line bg-white p-5 text-ink shadow-[0_12px_40px_-12px_rgb(15_17_15/0.35)]"
      >
        <DisplayToggles idPrefix="menu" />
        <p className="mt-4 border-t border-line pt-4 text-[0.9375rem] text-text-3">
          Remembered on this device. <a href="/accessibility" className="font-semibold text-ink underline underline-offset-4">More on accessibility</a>
        </p>
      </div>
    </div>
  );
}
