"use client";
import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm ChronosFlex. Ask me about your impact scenario." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input.trim() } as Message];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages: next }) });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Chat unavailable." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-[70vh] flex flex-col bg-white/90 dark:bg-black/60 backdrop-blur rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-3 py-2 text-sm font-medium border-b dark:border-zinc-800">ChronosFlex Chat</div>
      <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block px-2 py-1 rounded ${m.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs opacity-70">Thinking…</div>}
      </div>
      <div className="p-2 flex gap-2 border-t dark:border-zinc-800">
        <input value={input} onChange={(ev) => setInput(ev.target.value)}
               className="flex-1 px-2 py-1 rounded border bg-transparent" placeholder="Ask a question…" />
        <button onClick={send} className="px-3 py-1 rounded bg-blue-600 text-white">Send</button>
      </div>
    </div>
  );
}
