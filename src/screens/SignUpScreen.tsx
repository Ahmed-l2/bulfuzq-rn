import { FC, useState } from "react"
import { Alert, TextStyle, ViewStyle } from "react-native"
import { Redirect, useRouter } from "expo-router"
import { useAuth, useSignUp } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { getClerkErrorMessage } from "./SignInScreen"

export const SignUpScreen: FC = () => {
  const router = useRouter()
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const { signUp, setActive, isLoaded } = useSignUp()
  const { themed } = useAppTheme()
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [pendingVerification, setPendingVerification] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSignUp = async () => {
    if (!isLoaded || isSubmitting) return

    try {
      setIsSubmitting(true)
      await signUp.create({ emailAddress: emailAddress.trim(), password })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setPendingVerification(true)
    } catch (error) {
      Alert.alert("Sign up failed", getClerkErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const onVerify = async () => {
    if (!isLoaded || isSubmitting) return

    try {
      setIsSubmitting(true)
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.replace("/")
      } else {
        Alert.alert("Verification incomplete", "Please complete verification to continue.")
      }
    } catch (error) {
      Alert.alert("Verification failed", getClerkErrorMessage(error))
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
      <Text preset="heading" text="Create Account" style={themed($title)} />
      <Text
        size="md"
        text="Use the same email you use for BULFUZQ membership access."
        style={themed($body)}
      />

      {pendingVerification ? (
        <>
          <TextField
            label="Verification code"
            placeholder="Enter email code"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            keyboardType="number-pad"
          />
          <Button
            text={isSubmitting ? "Verifying..." : "Verify Email"}
            onPress={onVerify}
            disabled={isSubmitting}
          />
        </>
      ) : (
        <>
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={emailAddress}
            onChangeText={setEmailAddress}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <TextField
            label="Password"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
          <Button
            text={isSubmitting ? "Creating..." : "Create Account"}
            onPress={onSignUp}
            disabled={isSubmitting}
          />
        </>
      )}

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
