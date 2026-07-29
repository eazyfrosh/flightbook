"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getConversation, getMessages, markConversationRead, sendMessage } from "@/lib/services/chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const POLL_MS = 4000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function ChatWidget() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [connectError, setConnectError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hidden = pathname?.startsWith("/admin") || profile?.role === "admin";
  const loggedOut = !user && !hidden;

  useEffect(() => {
    if (!user || hidden) return;

    let cancelled = false;
    async function poll() {
      try {
        const [msgs, conversation] = await Promise.all([getMessages(user!.uid), getConversation(user!.uid)]);
        if (cancelled) return;
        setMessages(msgs);
        setUnread(Boolean(conversation?.unreadForUser));
        setConnectError(false);
      } catch {
        if (cancelled) return;
        setConnectError(true);
      }
    }
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, hidden]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open && user) {
      setUnread(false);
      markConversationRead(user.uid, "user");
    }
  }, [open, user]);

  if (hidden) return null;

  if (loggedOut) {
    return (
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <Link
          href="/auth/login"
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-xl shadow-brand-600/30 transition hover:bg-brand-700"
        >
          <MessageCircle size={18} /> Log in to chat
        </Link>
      </div>
    );
  }

  async function handleSend() {
    if (!text.trim() || sending || !user) return;
    setSending(true);
    const senderName = profile?.displayName || user.displayName || "You";
    const optimistic: ChatMessage = {
      id: `pending-${Date.now()}`,
      conversationId: user.uid,
      senderRole: "user",
      senderName,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    const toSend = text.trim();
    setText("");
    try {
      await sendMessage({
        userId: user.uid,
        userName: senderName,
        userEmail: user.email,
        senderRole: "user",
        senderName,
        text: toSend,
      });
    } catch (err) {
      setMessages((m) => m.filter((msg) => msg.id !== optimistic.id));
      setText(toSend);
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900">
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">SkyBook Support</p>
              <p className="text-xs text-white/70">We usually reply within a few minutes</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/15"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {connectError && (
              <p className="rounded-lg bg-red-50 p-3 text-center text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
                Couldn&apos;t connect to chat. Please try again shortly.
              </p>
            )}
            {messages.length === 0 ? (
              <p className="pt-10 text-center text-sm text-foreground/40">
                Send us a message and our support team will get back to you here.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={cn("flex", m.senderRole === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                      m.senderRole === "user"
                        ? "bg-brand-600 text-white"
                        : "bg-black/5 text-foreground dark:bg-white/10"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        m.senderRole === "user" ? "text-white/60" : "text-foreground/40"
                      )}
                    >
                      {m.senderRole === "admin" ? `${m.senderName} · ` : ""}
                      {formatTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-black/8 p-3 dark:border-white/10"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="w-full rounded-xl border border-black/12 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/15 dark:bg-white/5"
            />
            <Button type="submit" size="sm" disabled={sending || !text.trim()} aria-label="Send message">
              <Send size={15} />
            </Button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30 transition hover:bg-brand-700"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-gold-500 ring-2 ring-white dark:ring-neutral-900" />
        )}
      </button>
    </div>
  );
}
