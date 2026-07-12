import { FC, useState } from "react"
import { Alert, ViewStyle } from "react-native"
import { useSignUp } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { getClerkErrorMessage } from "./SignInScreen"

type SignUpScreenProps = AppStackScreenProps<"SignUp">

export const SignUpScreen: FC<SignUpScreenProps> = ({ navigation }) => {
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
      } else {
        Alert.alert("Verification incomplete", "Please complete verification to continue.")
      }
    } catch (error) {
      Alert.alert("Verification failed", getClerkErrorMessage(error))
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
      <Text preset="heading" text="Create Account" />
      <Text size="md" text="Use the same email you use for BULFUZQ membership access." />

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

      <Button
        preset="reversed"
        text="Back to Sign In"
        onPress={() => navigation.navigate("SignIn")}
      />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})
