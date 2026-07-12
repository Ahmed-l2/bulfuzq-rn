import { FC, useState } from "react"
import { Alert, ViewStyle } from "react-native"
import { useSignIn } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type SignInScreenProps = AppStackScreenProps<"SignIn">

export const SignInScreen: FC<SignInScreenProps> = ({ navigation }) => {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { themed } = useAppTheme()
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSignIn = async () => {
    if (!isLoaded || isSubmitting) return

    try {
      setIsSubmitting(true)
      const result = await signIn.create({ identifier: emailAddress.trim(), password })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
      } else {
        Alert.alert("Sign in incomplete", "Additional verification is required for this account.")
      }
    } catch (error) {
      Alert.alert("Sign in failed", getClerkErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="BUL Racing" />
      <Text size="md" text="Sign in with the same account you use on the BULFUZQ website." />

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
        text={isSubmitting ? "Signing in..." : "Sign In"}
        onPress={onSignIn}
        disabled={isSubmitting}
      />
      <Button
        preset="reversed"
        text="Create Account"
        onPress={() => navigation.navigate("SignUp")}
      />
    </Screen>
  )
}

export function getClerkErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray(error.errors) &&
    error.errors[0]?.message
  ) {
    return String(error.errors[0].message)
  }

  if (error instanceof Error) return error.message

  return "Please try again."
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})
