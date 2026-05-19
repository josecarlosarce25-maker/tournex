// Lightweight toast notifications. Call `toast("msg")` from anywhere; mount
// <Toaster /> once in the root layout so the messages have somewhere to show.
"use client";

import { useEffect, useState } from "react";

interface ToastMessage {
  id: number;
  text: string;
  kind: "ok" | "error";
}

const EVENT = "tournex:toast";

export function toast(text: string, kind: "ok" | "error" = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { text, kind } }));
}

export function Toaster() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    let counter = 0;
    function onToast(e: Event) {
      const detail = (e as CustomEvent).detail as {
        text: string;
        kind: "ok" | "error";
      };
      const id = ++counter;
      setMessages((m) => [...m, { id, ...detail }]);
      setTimeout(() => {
        setMessages((m) => m.filter((msg) => msg.id !== id));
      }, 2800);
    }
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex items-center gap-2.5 rounded-soft border bg-bg2 px-5 py-3.5 text-sm font-medium shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
            m.kind === "error" ? "border-red" : "border-lime"
          }`}
        >
          <span className={m.kind === "error" ? "text-red" : "text-lime"}>
            {m.kind === "error" ? "✕" : "✓"}
          </span>
          <span>{m.text}</span>
        </div>
      ))}
    </div>
  );
}
