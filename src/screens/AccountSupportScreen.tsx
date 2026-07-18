import { FC, useEffect, useMemo, useState } from "react"
import { Alert, FlatList, Linking, Pressable, TextStyle, View, ViewStyle } from "react-native"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UIIcon } from "@/components/ui"
import {
  useMarkSupportConversationRead,
  useSendSupportMessage,
  useSupportConversation,
  useSupportHome,
} from "@/services/query"
import type {
  SupportAttachmentInput,
  SupportConversationSummary,
  SupportMessage,
} from "@/services/supabase"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type SupportMode = "home" | "draft" | "chat"
const MAX_ATTACHMENT_SIZE_BYTES = Math.floor(2.5 * 1024 * 1024)
const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]

export const AccountSupportScreen: FC = () => {
  const router = useRouter()
  const { themed } = useAppTheme()
  const homeQuery = useSupportHome()
  const [mode, setMode] = useState<SupportMode>("home")
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [selectedAttachment, setSelectedAttachment] = useState<SupportAttachmentInput | null>(null)
  const conversationQuery = useSupportConversation(selectedConversationId)
  const sendMessage = useSendSupportMessage()
  const markConversationRead = useMarkSupportConversationRead()
  const activePayload = conversationQuery.data ?? homeQuery.data
  const activeConversation = activePayload?.conversation ?? null
  const conversations = homeQuery.data?.conversations ?? activePayload?.conversations ?? []
  const conversationStatus = activeConversation?.status === "closed" ? "closed" : "open"
  const canSend = mode === "draft" || conversationStatus !== "closed"

  const sortedMessages = useMemo(
    () =>
      [...(activePayload?.messages ?? [])].sort(
        (a, b) => getTime(a.created_at) - getTime(b.created_at),
      ),
    [activePayload?.messages],
  )

  useEffect(() => {
    if (mode !== "chat" || !activeConversation?.id) return
    void markConversationRead.mutateAsync(activeConversation.id)
  }, [activeConversation?.id, markConversationRead, mode, sortedMessages.length])

  return (
    <Screen
      preset="fixed"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
      systemBarStyle="light"
    >
      <View style={themed($header)}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={themed($backButton)}
        >
          <UIIcon name="arrow-left" size={20} color="#ffffff" />
          <Text size="sm" weight="medium" text="Back" style={themed($title)} />
        </Pressable>
        <Text preset="heading" text="Support" style={themed($title)} />
        <Text
          text="Start a new chat or continue an existing conversation with the BUL Racing team. Text chat is available now; attachment uploads require the website support flow."
          style={themed($body)}
        />
      </View>

      {mode === "home" ? (
        <SupportHome
          conversations={conversations}
          isLoading={homeQuery.isLoading}
          onOpenConversation={(conversationId) => {
            setSelectedConversationId(conversationId)
            setMode("chat")
          }}
          onStartNew={() => {
            setSelectedConversationId(null)
            setMessageText("")
            setMode("draft")
          }}
          onRefresh={() => void homeQuery.refetch()}
        />
      ) : (
        <View style={themed($chatPanel)}>
          <View style={themed($chatTopBar)}>
            <Pressable accessibilityRole="button" onPress={openHome} style={themed($smallBack)}>
              <UIIcon name="arrow-left" size={18} color="#ffffff" />
            </Pressable>
            <View style={themed($chatTitleBlock)}>
              <Text
                size="sm"
                weight="semiBold"
                text={
                  mode === "draft"
                    ? "New conversation"
                    : getConversationReference(activeConversation?.id)
                }
                style={themed($title)}
              />
              <Text
                size="xs"
                text={conversationStatus === "closed" ? "Closed" : "Open"}
                style={themed($body)}
              />
            </View>
          </View>

          <FlatList
            data={mode === "draft" ? [] : sortedMessages}
            keyExtractor={(message) => message.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            ListEmptyComponent={<EmptyMessages isDraft={mode === "draft"} />}
            contentContainerStyle={themed($messagesContent)}
            showsVerticalScrollIndicator={false}
          />

          <View style={themed($composer)}>
            {conversationStatus === "closed" && mode !== "draft" ? (
              <Text
                size="sm"
                text="This conversation is closed. Start a new chat to send another message."
                style={themed($body)}
              />
            ) : null}
            <TextField
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Write your message..."
              multiline
              editable={canSend && !sendMessage.isPending}
              inputWrapperStyle={themed($inputWrapper)}
              style={themed($input)}
            />
            <View style={themed($attachmentActions)}>
              <Pressable
                accessibilityRole="button"
                onPress={pickImageAttachment}
                style={themed($attachmentButton)}
              >
                <Text size="xs" weight="medium" text="Add Image" style={themed($linkText)} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={pickDocumentAttachment}
                style={themed($attachmentButton)}
              >
                <Text size="xs" weight="medium" text="Add File" style={themed($linkText)} />
              </Pressable>
              <Text size="xxs" text="PDF, JPG, PNG, WEBP up to 2.5 MB" style={themed($muted)} />
            </View>
            {selectedAttachment ? (
              <View style={themed($selectedAttachment)}>
                <Text
                  size="xs"
                  text={selectedAttachment.name}
                  numberOfLines={1}
                  style={themed($title)}
                />
                <Pressable accessibilityRole="button" onPress={() => setSelectedAttachment(null)}>
                  <Text size="xs" weight="medium" text="Remove" style={themed($linkText)} />
                </Pressable>
              </View>
            ) : null}
            <Button
              text={sendMessage.isPending ? "Sending..." : "Send Message"}
              onPress={handleSendMessage}
              disabled={
                (!messageText.trim() && !selectedAttachment) || !canSend || sendMessage.isPending
              }
            />
          </View>
        </View>
      )}
    </Screen>
  )

  function openHome() {
    setMode("home")
    setMessageText("")
    void homeQuery.refetch()
  }

  async function handleSendMessage() {
    try {
      const payload = await sendMessage.mutateAsync({
        content: messageText,
        conversationId: selectedConversationId,
        startNew: mode === "draft",
      })

      setMessageText("")
      setSelectedAttachment(null)
      setSelectedConversationId(payload.conversation?.id ?? null)
      setMode("chat")
    } catch (error) {
      Alert.alert("Unable to send message", getErrorMessage(error))
    }
  }

  async function pickImageAttachment() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        Alert.alert("Permission required", "Allow photo access to attach an image.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.82,
      })

      if (result.canceled) return
      const asset = result.assets[0]
      if (!asset?.uri) return
      setSelectedAttachment(
        normalizeAttachment({
          mimeType: asset.mimeType ?? "image/jpeg",
          name: asset.fileName ?? `support-image-${Date.now()}.jpg`,
          size: asset.fileSize,
          uri: asset.uri,
        }),
      )
    } catch (error) {
      Alert.alert("Unable to attach image", getErrorMessage(error))
    }
  }

  async function pickDocumentAttachment() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ACCEPTED_DOCUMENT_TYPES,
      })

      if (result.canceled) return
      const asset = result.assets[0]
      if (!asset?.uri) return
      setSelectedAttachment(
        normalizeAttachment({
          mimeType: asset.mimeType ?? "application/pdf",
          name: asset.name,
          size: asset.size,
          uri: asset.uri,
        }),
      )
    } catch (error) {
      Alert.alert("Unable to attach file", getErrorMessage(error))
    }
  }
}

function normalizeAttachment(attachment: SupportAttachmentInput) {
  if (attachment.size && attachment.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new Error("Attachment must be 2.5 MB or smaller.")
  }

  if (!ACCEPTED_DOCUMENT_TYPES.includes(attachment.mimeType)) {
    throw new Error("Only PDF, JPEG, PNG, and WEBP attachments are supported.")
  }

  return attachment
}

function SupportHome({
  conversations,
  isLoading,
  onOpenConversation,
  onRefresh,
  onStartNew,
}: {
  conversations: SupportConversationSummary[]
  isLoading: boolean
  onOpenConversation: (conversationId: string) => void
  onRefresh: () => void
  onStartNew: () => void
}) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($homePanel)}>
      <Button text="Start New Chat" onPress={onStartNew} />
      <View style={themed($sectionHeader)}>
        <Text preset="subheading" text="Conversations" style={themed($title)} />
        <Pressable accessibilityRole="button" onPress={onRefresh}>
          <Text size="xs" weight="medium" text="Refresh" style={themed($linkText)} />
        </Pressable>
      </View>
      {isLoading ? <Text text="Loading support history..." style={themed($body)} /> : null}
      {conversations.length === 0 && !isLoading ? (
        <View style={themed($empty)}>
          <UIIcon name="message-circle" size={42} color="#525252" strokeWidth={1.8} />
          <Text text="No support conversations yet." style={themed($body)} />
        </View>
      ) : null}
      {conversations.map((conversation) => (
        <Pressable
          key={conversation.id}
          accessibilityRole="button"
          onPress={() => onOpenConversation(conversation.id)}
          style={({ pressed }) => [themed($conversationCard), pressed && themed($pressed)]}
        >
          <View style={themed($conversationTop)}>
            <Text
              size="sm"
              weight="semiBold"
              text={getConversationReference(conversation.id)}
              style={themed($title)}
            />
            <Text
              size="xxs"
              weight="bold"
              text={conversation.status === "closed" ? "CLOSED" : "OPEN"}
              style={themed(conversation.status === "closed" ? $closedText : $openText)}
            />
          </View>
          <Text
            size="xs"
            text={conversation.latest_message_preview ?? "No messages yet"}
            numberOfLines={1}
            style={themed($body)}
          />
          <Text size="xxs" text={formatDate(conversation.last_message_at)} style={themed($muted)} />
        </Pressable>
      ))}
    </View>
  )
}

function MessageBubble({ message }: { message: SupportMessage }) {
  const { themed } = useAppTheme()
  const isAdmin = Boolean(message.is_admin)

  return (
    <View style={themed([isAdmin ? $adminBubble : $customerBubble])}>
      <Text
        size="xs"
        weight="bold"
        text={isAdmin ? "BUL Support" : "You"}
        style={themed($bubbleLabel)}
      />
      <Text text={message.content ?? "Attachment"} style={themed($bubbleText)} />
      {message.file_url ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(message.file_url ?? "")}
        >
          <Text size="xs" weight="medium" text="Open attachment" style={themed($attachmentLink)} />
        </Pressable>
      ) : null}
      <Text size="xxs" text={formatDate(message.created_at)} style={themed($bubbleTime)} />
    </View>
  )
}

function EmptyMessages({ isDraft }: { isDraft: boolean }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($empty)}>
      <UIIcon name="message-circle" size={42} color="#525252" strokeWidth={1.8} />
      <Text
        text={
          isDraft ? "Send a message to start your chat." : "No messages in this conversation yet."
        }
        style={themed($body)}
      />
    </View>
  )
}

function getConversationReference(conversationId?: string | null) {
  if (!conversationId) return "Support Chat"
  return `#${conversationId.replace(/-/g, "").slice(0, 8).toUpperCase()}`
}

function formatDate(value?: string | null) {
  if (!value) return ""
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  )
}

function getTime(value?: string | null) {
  return value ? new Date(value).getTime() : 0
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Please try again."
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  flex: 1,
  gap: spacing.lg,
  padding: spacing.lg,
})
const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
  paddingTop: spacing.lg,
})
const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  gap: spacing.xs,
})
const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3", lineHeight: 22 })
const $muted: ThemedStyle<TextStyle> = () => ({ color: "#737373" })
const $linkText: ThemedStyle<TextStyle> = () => ({ color: "#E10600" })
const $homePanel: ThemedStyle<ViewStyle> = ({ spacing }) => ({ flex: 1, gap: spacing.md })
const $sectionHeader: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
})
const $conversationCard: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "#111516",
  borderRadius: radius.xl,
  gap: spacing.xs,
  padding: spacing.lg,
})
const $conversationTop: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
})
const $pressed: ThemedStyle<ViewStyle> = () => ({ opacity: 0.78 })
const $openText: ThemedStyle<TextStyle> = () => ({ color: "#E10600", letterSpacing: 0.8 })
const $closedText: ThemedStyle<TextStyle> = () => ({ color: "#22c55e", letterSpacing: 0.8 })
const $empty: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.md,
  paddingVertical: spacing.xl,
})
const $chatPanel: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#090a0b",
  borderRadius: radius.xl,
  flex: 1,
  overflow: "hidden",
})
const $chatTopBar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  borderBottomColor: "#171717",
  borderBottomWidth: 1,
  flexDirection: "row",
  gap: spacing.md,
  padding: spacing.md,
})
const $smallBack: ThemedStyle<ViewStyle> = ({ radius }) => ({
  alignItems: "center",
  backgroundColor: "#171717",
  borderRadius: radius.round,
  height: 36,
  justifyContent: "center",
  width: 36,
})
const $chatTitleBlock: ThemedStyle<ViewStyle> = () => ({ flex: 1 })
const $messagesContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  padding: spacing.md,
})
const $composer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderTopColor: "#171717",
  borderTopWidth: 1,
  gap: spacing.sm,
  padding: spacing.md,
})
const $attachmentActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})
const $attachmentButton: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  backgroundColor: "rgba(225, 6, 0, 0.12)",
  borderRadius: radius.round,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})
const $selectedAttachment: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignItems: "center",
  backgroundColor: "#111516",
  borderColor: "#262626",
  borderRadius: radius.lg,
  borderWidth: 1,
  flexDirection: "row",
  gap: spacing.md,
  justifyContent: "space-between",
  padding: spacing.sm,
})
const $inputWrapper: ThemedStyle<ViewStyle> = ({ radius }) => ({
  backgroundColor: "#111516",
  borderColor: "#262626",
  borderRadius: radius.lg,
  minHeight: 96,
})
const $input: ThemedStyle<TextStyle> = ({ typography }) => ({
  color: "#ffffff",
  fontFamily: typography.primary.normal,
  textAlignVertical: "top",
})
const $customerBubble: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignSelf: "flex-end",
  backgroundColor: "#E10600",
  borderRadius: radius.xl,
  gap: spacing.xxxs,
  maxWidth: "86%",
  padding: spacing.md,
})
const $adminBubble: ThemedStyle<ViewStyle> = ({ radius, spacing }) => ({
  alignSelf: "flex-start",
  backgroundColor: "#171717",
  borderRadius: radius.xl,
  gap: spacing.xxxs,
  maxWidth: "86%",
  padding: spacing.md,
})
const $bubbleLabel: ThemedStyle<TextStyle> = () => ({ color: "#ffffff", opacity: 0.8 })
const $bubbleText: ThemedStyle<TextStyle> = () => ({ color: "#ffffff", lineHeight: 22 })
const $bubbleTime: ThemedStyle<TextStyle> = () => ({ color: "#ffffff", opacity: 0.62 })
const $attachmentLink: ThemedStyle<TextStyle> = () => ({
  color: "#ffffff",
  textDecorationLine: "underline",
})
