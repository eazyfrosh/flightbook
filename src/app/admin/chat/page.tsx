"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth-context";
import {
  getMessages,
  listConversations,
  markConversationRead,
  sendMessage,
} from "@/lib/services/chat";
import { formatDateShort, formatTime, cn } from "@/lib/utils";
import type { ChatConversation, ChatMessage } from "@/types";

const POLL_MS = 4000;

export default function AdminChatPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const list = await listConversations();
        if (cancelled) return;
        setConversations(list);
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load conversations.");
      }
    }
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    async function poll() {
      try {
        const msgs = await getMessages(selectedId!);
        if (cancelled) return;
        setMessages(msgs);
        setMessagesError(null);
      } catch (err) {
        if (cancelled) return;
        setMessagesError(err instanceof Error ? err.message : "Failed to load messages.");
      }
    }
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId) markConversationRead(selectedId, "admin");
  }, [selectedId, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const selected = conversations?.find((c) => c.id === selectedId) ?? null;

  async function handleSend() {
    if (!text.trim() || sending || !selected) return;
    setSending(true);
    const senderName = profile?.displayName || "SkyBook Support";
    const toSend = text.trim();
    setText("");
    try {
      await sendMessage({
        userId: selected.userId,
        userName: selected.userName,
        userEmail: selected.userEmail,
        senderRole: "admin",
        senderName,
        text: toSend,
      });
      setMessages(await getMessages(selected.userId));
      setConversations(await listConversations());
    } catch (err) {
      setText(toSend);
      toast.error(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  if (conversations === null) {
    if (loadError) {
      return (
        <EmptyState
          icon={<MessageCircle size={22} />}
          title="Couldn't load conversations"
          description={`${loadError} If you're using a real Firebase project, make sure the updated firestore.rules (with the chat_conversations/chat_messages rules) has been deployed.`}
        />
      );
    }
    return <LoadingState label="Loading conversations…" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Live chat</h1>
        <p className="mt-1 text-sm text-foreground/60">Respond to messages from customers in real time.</p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={22} />}
          title="No conversations yet"
          description="Messages from the chat widget will show up here."
        />
      ) : (
        <Card className="grid grid-cols-1 overflow-hidden md:grid-cols-[18rem_1fr]">
          <div className="max-h-[32rem] overflow-y-auto border-b border-black/8 dark:border-white/10 md:max-h-[36rem] md:border-b-0 md:border-r">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b border-black/5 px-4 py-3 text-left transition dark:border-white/5",
                  selectedId === c.id ? "bg-brand-50 dark:bg-brand-500/10" : "hover:bg-black/[0.03] dark:hover:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{c.userName || c.userEmail}</p>
                  {c.unreadForAdmin && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                </div>
                <p className="truncate text-xs text-foreground/50">
                  {c.lastSenderRole === "admin" ? "You: " : ""}
                  {c.lastMessage}
                </p>
                <p className="text-[10px] text-foreground/35">
                  {formatDateShort(c.lastMessageAt)} · {formatTime(c.lastMessageAt)}
                </p>
              </button>
            ))}
          </div>

          <div className="flex h-[32rem] flex-col md:h-[36rem]">
            {!selected ? (
              <div className="flex flex-1 items-center justify-center text-sm text-foreground/40">
                Select a conversation to view messages.
              </div>
            ) : (
              <>
                <div className="border-b border-black/8 px-4 py-3 dark:border-white/10">
                  <p className="font-semibold">{selected.userName || "Customer"}</p>
                  <p className="text-xs text-foreground/50">{selected.userEmail}</p>
                </div>
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messagesError && (
                    <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
                      {messagesError}
                    </p>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.senderRole === "admin" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                          m.senderRole === "admin"
                            ? "bg-brand-600 text-white"
                            : "bg-black/5 text-foreground dark:bg-white/10"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            m.senderRole === "admin" ? "text-white/60" : "text-foreground/40"
                          )}
                        >
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
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
                    placeholder="Reply to customer…"
                    className="w-full rounded-xl border border-black/12 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/15 dark:bg-white/5"
                  />
                  <Button type="submit" size="sm" disabled={sending || !text.trim()} aria-label="Send reply">
                    <Send size={15} />
                  </Button>
                </form>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
