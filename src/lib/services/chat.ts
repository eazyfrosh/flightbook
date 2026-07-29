import { getAll, getOne, queryByField, upsert } from "@/lib/services/store";
import type { ChatConversation, ChatMessage, ChatSenderRole } from "@/types";

const CONVERSATIONS = "chat_conversations";
const MESSAGES = "chat_messages";

export function getConversation(userId: string): Promise<ChatConversation | null> {
  return getOne<ChatConversation>(CONVERSATIONS, userId);
}

export async function listConversations(): Promise<ChatConversation[]> {
  const items = await getAll<ChatConversation>(CONVERSATIONS);
  return items.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export async function getMessages(userId: string): Promise<ChatMessage[]> {
  const items = await queryByField<ChatMessage>(MESSAGES, "conversationId", userId);
  return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function sendMessage(params: {
  userId: string;
  userName: string;
  userEmail: string;
  senderRole: ChatSenderRole;
  senderName: string;
  text: string;
}): Promise<void> {
  const { userId, userName, userEmail, senderRole, senderName, text } = params;
  const trimmed = text.trim();
  if (!trimmed) return;
  const now = new Date().toISOString();

  const message: ChatMessage = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversationId: userId,
    senderRole,
    senderName,
    text: trimmed,
    createdAt: now,
  };
  await upsert(MESSAGES, message);

  const existing = await getConversation(userId);
  const conversation: ChatConversation = {
    id: userId,
    userId,
    userName,
    userEmail,
    lastMessage: trimmed,
    lastMessageAt: now,
    lastSenderRole: senderRole,
    unreadForAdmin: senderRole === "user" ? true : (existing?.unreadForAdmin ?? false),
    unreadForUser: senderRole === "admin" ? true : (existing?.unreadForUser ?? false),
    createdAt: existing?.createdAt ?? now,
  };
  await upsert(CONVERSATIONS, conversation);
}

export async function markConversationRead(userId: string, role: ChatSenderRole): Promise<void> {
  const conversation = await getConversation(userId);
  if (!conversation) return;
  if (role === "admin" ? !conversation.unreadForAdmin : !conversation.unreadForUser) return;
  await upsert(CONVERSATIONS, {
    ...conversation,
    ...(role === "admin" ? { unreadForAdmin: false } : { unreadForUser: false }),
  });
}
