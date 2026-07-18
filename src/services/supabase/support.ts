import { createAuthenticatedSupabaseClient, GetClerkSupabaseToken } from "./client"
import type { Conversation, SupportMessage } from "./database.types"

const CHAT_FILES_BUCKET = "chat-files"
const MAX_SUPPORT_ATTACHMENT_SIZE_BYTES = Math.floor(2.5 * 1024 * 1024)
const ACCEPTED_SUPPORT_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
])

export type SupportAttachmentInput = {
  mimeType: string
  name: string
  size?: number | null
  uri: string
}

export type SupportConversationSummary = Pick<
  Conversation,
  "id" | "created_at" | "status" | "last_message_at"
> & {
  latest_message_preview: string | null
}

export type SupportConversationPayload = {
  conversation: Conversation | null
  conversations: SupportConversationSummary[]
  messages: SupportMessage[]
}

export type SupportUnreadSummary = {
  unreadAdminMessages: number
}

export async function getSupportHome(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  customerId: string,
): Promise<SupportConversationPayload> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const conversations = await getCustomerConversations(supabase, customerId)
  const selectedConversation =
    conversations.find((conversation) => conversation.status !== "closed") ??
    conversations[0] ??
    null

  if (!selectedConversation) {
    return { conversation: null, conversations: [], messages: [] }
  }

  const messages = await getConversationMessages(supabase, selectedConversation.id)

  return {
    conversation: selectedConversation,
    conversations: await buildConversationSummaries(supabase, conversations),
    messages,
  }
}

export async function getSupportConversation(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  customerId: string,
  conversationId: string,
): Promise<SupportConversationPayload> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const conversations = await getCustomerConversations(supabase, customerId)
  const selectedConversation =
    conversations.find((conversation) => conversation.id === conversationId) ?? null

  if (!selectedConversation) throw new Error("Support conversation not found.")

  return {
    conversation: selectedConversation,
    conversations: await buildConversationSummaries(supabase, conversations),
    messages: await getConversationMessages(supabase, selectedConversation.id),
  }
}

export async function sendSupportMessage({
  content,
  conversationId,
  customerId,
  attachment,
  getClerkSupabaseToken,
  startNew,
}: {
  attachment?: SupportAttachmentInput | null
  content: string
  conversationId?: string | null
  customerId: string
  getClerkSupabaseToken: GetClerkSupabaseToken
  startNew?: boolean
}): Promise<SupportConversationPayload> {
  const trimmedContent = content.trim()
  if (!trimmedContent && !attachment) throw new Error("Message cannot be empty.")

  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  let conversation: Conversation | null = null

  if (conversationId && !startNew) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("customer_id", customerId)
      .eq("id", conversationId)
      .maybeSingle()

    if (error) throw error
    conversation = data
    if (!conversation) throw new Error("Support conversation not found.")
    if (conversation.status === "closed") throw new Error("This support conversation is closed.")
  } else if (!startNew) {
    const conversations = await getCustomerConversations(supabase, customerId)
    conversation = conversations.find((item) => item.status !== "closed") ?? null
  }

  if (!conversation) conversation = await createConversation(supabase, customerId)

  const fileUrl = attachment
    ? await uploadSupportAttachment(supabase, customerId, conversation.id, attachment)
    : null

  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_type: "customer",
    sender_id: customerId,
    content: trimmedContent || null,
    message_type: "text",
    file_url: fileUrl,
    is_admin: false,
  })

  if (messageError) throw messageError

  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from("conversations")
    .update({
      last_message_at: now,
      status: "open",
      unread_count: (conversation.unread_count ?? 0) + 1,
    })
    .eq("id", conversation.id)

  if (updateError) throw updateError

  return getSupportConversation(getClerkSupabaseToken, customerId, conversation.id)
}

export async function markSupportConversationRead(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  customerId: string,
  conversationId: string,
): Promise<void> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", customerId)
    .eq("id", conversationId)
    .maybeSingle()

  if (conversationError) throw conversationError
  if (!conversation) return

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("is_admin", true)
    .is("read_at", null)

  if (error) throw error
}

export async function getSupportUnreadSummary(
  getClerkSupabaseToken: GetClerkSupabaseToken,
  customerId: string,
): Promise<SupportUnreadSummary> {
  const supabase = createAuthenticatedSupabaseClient(getClerkSupabaseToken)
  const conversations = await getCustomerConversations(supabase, customerId)
  if (conversations.length === 0) return { unreadAdminMessages: 0 }

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in(
      "conversation_id",
      conversations.map((conversation) => conversation.id),
    )
    .eq("is_admin", true)
    .is("read_at", null)

  if (error) throw error
  return { unreadAdminMessages: count ?? 0 }
}

async function createConversation(
  supabase: ReturnType<typeof createAuthenticatedSupabaseClient>,
  customerId: string,
) {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ customer_id: customerId, status: "open", unread_count: 0 })
    .select("*")
    .single()

  if (error) throw error
  return data
}

async function getCustomerConversations(
  supabase: ReturnType<typeof createAuthenticatedSupabaseClient>,
  customerId: string,
) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("customer_id", customerId)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

async function getConversationMessages(
  supabase: ReturnType<typeof createAuthenticatedSupabaseClient>,
  conversationId: string,
) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return signMessageAttachments(supabase, data ?? [])
}

async function uploadSupportAttachment(
  supabase: ReturnType<typeof createAuthenticatedSupabaseClient>,
  customerId: string,
  conversationId: string,
  attachment: SupportAttachmentInput,
) {
  if (attachment.size && attachment.size > MAX_SUPPORT_ATTACHMENT_SIZE_BYTES) {
    throw new Error("Attachment must be 2.5 MB or smaller.")
  }

  if (!ACCEPTED_SUPPORT_ATTACHMENT_TYPES.has(attachment.mimeType)) {
    throw new Error("Only PDF, JPEG, PNG, and WEBP attachments are supported.")
  }

  const extension = getAttachmentExtension(attachment.name, attachment.mimeType)
  const filePath = `${customerId}/${conversationId}/${Date.now()}_${randomId()}.${extension}`
  const response = await fetch(attachment.uri)
  const blob = await response.blob()
  const { error } = await supabase.storage.from(CHAT_FILES_BUCKET).upload(filePath, blob, {
    cacheControl: "3600",
    contentType: attachment.mimeType,
    upsert: false,
  })

  if (error) throw error
  return `${CHAT_FILES_BUCKET}://${filePath}`
}

async function signMessageAttachments(
  supabase: ReturnType<typeof createAuthenticatedSupabaseClient>,
  messages: SupportMessage[],
) {
  return Promise.all(
    messages.map(async (message) => ({
      ...message,
      file_url: await signFileUrl(supabase, message.file_url),
    })),
  )
}

async function signFileUrl(
  supabase: ReturnType<typeof createAuthenticatedSupabaseClient>,
  fileUrl: string | null,
) {
  if (!fileUrl || fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl

  const storagePath = fileUrl.startsWith(`${CHAT_FILES_BUCKET}://`)
    ? fileUrl.replace(`${CHAT_FILES_BUCKET}://`, "")
    : fileUrl
  const { data, error } = await supabase.storage
    .from(CHAT_FILES_BUCKET)
    .createSignedUrl(storagePath, 60 * 60)

  if (error) return null
  return data?.signedUrl ?? null
}

async function buildConversationSummaries(
  supabase: ReturnType<typeof createAuthenticatedSupabaseClient>,
  conversations: Conversation[],
): Promise<SupportConversationSummary[]> {
  if (conversations.length === 0) return []

  const conversationIds = conversations.map((conversation) => conversation.id)
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })

  if (error) throw error
  const latestMessages = new Map<string, SupportMessage>()

  for (const message of data ?? []) {
    if (message.conversation_id && !latestMessages.has(message.conversation_id)) {
      latestMessages.set(message.conversation_id, message)
    }
  }

  return conversations.map((conversation) => ({
    id: conversation.id,
    created_at: conversation.created_at,
    status: conversation.status === "closed" ? "closed" : "open",
    last_message_at: conversation.last_message_at ?? conversation.created_at,
    latest_message_preview: getMessagePreview(latestMessages.get(conversation.id)),
  }))
}

function getMessagePreview(message?: SupportMessage) {
  if (!message) return null
  if (message.content) return message.content.slice(0, 120)
  if (message.file_url) return "Attachment"
  return null
}

function getAttachmentExtension(name: string, mimeType: string) {
  const extension = name.includes(".") ? name.split(".").pop()?.toLowerCase() : null
  if (extension) return extension
  if (mimeType === "application/pdf") return "pdf"
  if (mimeType === "image/png") return "png"
  if (mimeType === "image/webp") return "webp"
  return "jpg"
}

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}
