"use client";

import { useEffect, useId, useRef, useState } from "react";

/*
 * A two-press confirm ("Cancel request" -> "Yes, cancel it / No, keep it")
 * swaps the pressed button for new ones, which would drop keyboard and screen
 * reader focus to the top of the page. This moves focus to "Yes" when the
 * question appears, and back to the first button when it is put away. Put
 * `questionId` on the question and `aria-labelledby={questionId}` on the
 * group around the answers, so the question is read out as focus arrives.
 */
export function useConfirm() {
  const [confirming, setConfirming] = useState(false);
  const askRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  // Only move focus after a press, never when the component first mounts.
  const pressed = useRef(false);
  const questionId = useId();

  useEffect(() => {
    if (!pressed.current) return;
    (confirming ? yesRef : askRef).current?.focus();
  }, [confirming]);

  const ask = () => {
    pressed.current = true;
    setConfirming(true);
  };
  const back = () => {
    pressed.current = true;
    setConfirming(false);
  };

  return { confirming, ask, back, askRef, yesRef, questionId };
}
