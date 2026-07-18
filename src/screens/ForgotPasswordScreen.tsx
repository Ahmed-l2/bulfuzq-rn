import { FC, useState } from "react"
import { Alert, TextStyle, ViewStyle } from "react-native"
import { Redirect, useRouter } from "expo-router"
import { useAuth, useSignIn } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { getClerkErrorMessage } from "./SignInScreen"

type ResetStep = "request" | "verify"

export const ForgotPasswordScreen: FC = () => {
  const router = useRouter()
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const { signIn, setActive, isLoaded } = useSignIn()
  const { themed } = useAppTheme()
  const [emailAddress, setEmailAddress] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState<ResetStep>("request")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function requestResetCode() {
    if (!isLoaded || isSubmitting) return

    const identifier = emailAddress.trim()
    if (!identifier) {
      Alert.alert("Email required", "Enter your email address to receive a reset code.")
      return
    }

    try {
      setIsSubmitting(true)
      await signIn.create({ identifier, strategy: "reset_password_email_code" })
      setStep("verify")
    } catch (error) {
      Alert.alert("Reset failed", getClerkErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitNewPassword() {
    if (!isLoaded || isSubmitting) return

    const trimmedCode = code.trim()
    if (!trimmedCode || !password) {
      Alert.alert("Missing details", "Enter the reset code and your new password.")
      return
    }

    try {
      setIsSubmitting(true)
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: trimmedCode,
        password,
      })

      if (result.status === "complete") {
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId })
          router.replace("/")
          return
        }

        Alert.alert("Password updated", "Your password was reset. Sign in with your new password.")
        router.replace("/sign-in")
        return
      }

      Alert.alert("Reset incomplete", "Additional verification is required before continuing.")
    } catch (error) {
      Alert.alert("Reset failed", getClerkErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthLoaded && isSignedIn) return <Redirect href="/" />

  return (
    <Screen
      preset="auto"
      backgroundColor="#000000"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="Reset Password" style={themed($title)} />
      <Text
        size="md"
        text={
          step === "request"
            ? "Enter your email and we’ll send a verification code."
            : "Enter the code from your email and choose a new password."
        }
        style={themed($body)}
      />

      <TextField
        label="Email"
        placeholder="you@example.com"
        value={emailAddress}
        onChangeText={setEmailAddress}
        editable={step === "request" && !isSubmitting}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />

      {step === "verify" ? (
        <>
          <TextField
            label="Reset code"
            placeholder="Enter code"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            keyboardType="number-pad"
          />
          <TextField
            label="New password"
            placeholder="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />
        </>
      ) : null}

      <Button
        text={
          step === "request"
            ? isSubmitting
              ? "Sending..."
              : "Send Reset Code"
            : isSubmitting
              ? "Updating..."
              : "Update Password"
        }
        onPress={step === "request" ? requestResetCode : submitNewPassword}
        disabled={isSubmitting}
      />

      {step === "verify" ? (
        <Button
          preset="reversed"
          text="Resend Code"
          onPress={requestResetCode}
          disabled={isSubmitting}
        />
      ) : null}

      <Button preset="reversed" text="Back to Sign In" onPress={() => router.replace("/sign-in")} />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "#000000",
  flexGrow: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = () => ({ color: "#ffffff" })
const $body: ThemedStyle<TextStyle> = () => ({ color: "#a3a3a3" })
