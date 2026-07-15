import { FC, useState } from "react"
import { Alert, ViewStyle } from "react-native"
import * as Linking from "expo-linking"
import { useSignIn, useSSO } from "@clerk/clerk-expo"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type SignInScreenProps = AppStackScreenProps<"SignIn">
type VerificationStage = "first" | "second"
type VerificationStrategy = "email_code" | "phone_code" | "totp" | "backup_code"
type FirstVerificationStrategy = Extract<VerificationStrategy, "email_code" | "phone_code">
type OAuthStrategy = "oauth_google" | "oauth_apple"
type SupportedFactor = {
  strategy: VerificationStrategy
  safeIdentifier?: string
  emailAddressId?: string
  phoneNumberId?: string
}

type PendingVerification =
  | {
      stage: Extract<VerificationStage, "first">
      strategy: FirstVerificationStrategy
      label: string
      factor: SupportedFactor
    }
  | {
      stage: Extract<VerificationStage, "second">
      strategy: VerificationStrategy
      label: string
      factor: SupportedFactor
    }

export const SignInScreen: FC<SignInScreenProps> = ({ navigation }) => {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startSSOFlow } = useSSO()
  const { themed } = useAppTheme()
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSignIn = async () => {
    if (!isLoaded || isSubmitting) return

    try {
      setIsSubmitting(true)
      const result = await signIn.create({ identifier: emailAddress.trim(), password })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
      } else {
        await continueAdditionalVerification(result)
      }
    } catch (error) {
      Alert.alert("Sign in failed", getClerkErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const onVerify = async () => {
    if (!isLoaded || isSubmitting || !signIn || !pendingVerification) return

    try {
      setIsSubmitting(true)

      const trimmedCode = code.trim()
      if (!trimmedCode) {
        Alert.alert("Code required", "Enter the verification code to continue.")
        return
      }

      const result =
        pendingVerification.stage === "first"
          ? await signIn.attemptFirstFactor({
              strategy: pendingVerification.strategy,
              code: trimmedCode,
            })
          : await signIn.attemptSecondFactor({
              strategy: pendingVerification.strategy,
              code: trimmedCode,
            })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
      } else {
        await continueAdditionalVerification(result)
      }
    } catch (error) {
      Alert.alert("Verification failed", getClerkErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const onOAuthSignIn = async (strategy: OAuthStrategy) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      const { createdSessionId, setActive: setOAuthActive } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL("/"),
      })

      if (createdSessionId) {
        if (setOAuthActive) {
          await setOAuthActive({ session: createdSessionId })
        } else if (setActive) {
          await setActive({ session: createdSessionId })
        } else {
          Alert.alert(
            "Sign in incomplete",
            "Clerk returned a session but it could not be activated.",
          )
        }
      }
    } catch (error) {
      Alert.alert("Sign in failed", getClerkErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const continueAdditionalVerification = async (result: typeof signIn) => {
    if (!result) return

    if (result.status === "needs_first_factor") {
      const factor = pickFirstVerificationFactor(result.supportedFirstFactors)

      if (!factor) {
        Alert.alert(
          "Sign in incomplete",
          "This account requires a verification method not yet available in the app.",
        )
        return
      }

      if (factor.strategy === "email_code") {
        if (!factor.emailAddressId) {
          Alert.alert(
            "Sign in incomplete",
            "Clerk did not return an email address for verification.",
          )
          return
        }
        await result.prepareFirstFactor({
          strategy: factor.strategy,
          emailAddressId: factor.emailAddressId,
        })
      }

      if (factor.strategy === "phone_code") {
        if (!factor.phoneNumberId) {
          Alert.alert("Sign in incomplete", "Clerk did not return a phone number for verification.")
          return
        }
        await result.prepareFirstFactor({
          strategy: factor.strategy,
          phoneNumberId: factor.phoneNumberId,
        })
      }

      setCode("")
      setPendingVerification({
        stage: "first",
        strategy: factor.strategy,
        label: getFactorLabel(factor),
        factor,
      })
      return
    }

    if (result.status === "needs_second_factor") {
      const factor = pickVerificationFactor(result.supportedSecondFactors)

      if (!factor) {
        Alert.alert(
          "Sign in incomplete",
          "This account requires a second factor not yet available in the app.",
        )
        return
      }

      if (factor.strategy === "email_code") {
        await result.prepareSecondFactor({
          strategy: factor.strategy,
          emailAddressId: factor.emailAddressId,
        })
      }

      if (factor.strategy === "phone_code") {
        await result.prepareSecondFactor({
          strategy: factor.strategy,
          phoneNumberId: factor.phoneNumberId,
        })
      }

      setCode("")
      setPendingVerification({
        stage: "second",
        strategy: factor.strategy,
        label: getFactorLabel(factor),
        factor,
      })
      return
    }

    Alert.alert("Sign in incomplete", "Additional verification is required for this account.")
  }

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($container)}
    >
      <Text preset="heading" text="BUL Racing" />
      <Text size="md" text="Sign in with the same account you use on the BULFUZQ website." />

      {pendingVerification ? (
        <>
          <Text size="sm" text={`Enter the verification code from ${pendingVerification.label}.`} />
          <TextField
            label="Verification code"
            placeholder="Enter code"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            keyboardType={pendingVerification.strategy === "backup_code" ? "default" : "number-pad"}
          />
          <Button
            text={isSubmitting ? "Verifying..." : "Verify and Sign In"}
            onPress={onVerify}
            disabled={isSubmitting}
          />
          <Button
            preset="reversed"
            text="Use a different account"
            onPress={() => {
              setPendingVerification(null)
              setCode("")
            }}
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
            text={isSubmitting ? "Signing in..." : "Sign In"}
            onPress={onSignIn}
            disabled={isSubmitting}
          />
          <Button
            preset="reversed"
            text="Continue with Google"
            onPress={() => onOAuthSignIn("oauth_google")}
            disabled={isSubmitting}
          />
          <Button
            preset="reversed"
            text="Continue with Apple"
            onPress={() => onOAuthSignIn("oauth_apple")}
            disabled={isSubmitting}
          />
          <Button
            preset="reversed"
            text="Create Account"
            onPress={() => navigation.navigate("SignUp")}
          />
        </>
      )}
    </Screen>
  )
}

function pickVerificationFactor(
  factors: readonly { strategy: string }[] | null,
): SupportedFactor | undefined {
  const strategyOrder: VerificationStrategy[] = ["email_code", "phone_code", "totp", "backup_code"]

  return strategyOrder
    .map(
      (strategy) =>
        factors?.find((factor) => factor.strategy === strategy) as SupportedFactor | undefined,
    )
    .find((factor): factor is SupportedFactor => Boolean(factor))
}

function pickFirstVerificationFactor(
  factors: readonly { strategy: string }[] | null,
): (SupportedFactor & { strategy: FirstVerificationStrategy }) | undefined {
  const strategyOrder: FirstVerificationStrategy[] = ["email_code", "phone_code"]

  return strategyOrder
    .map(
      (strategy) =>
        factors?.find((factor) => factor.strategy === strategy) as
          (SupportedFactor & { strategy: FirstVerificationStrategy }) | undefined,
    )
    .find((factor): factor is SupportedFactor & { strategy: FirstVerificationStrategy } =>
      Boolean(factor),
    )
}

function getFactorLabel(factor: SupportedFactor) {
  if (factor.safeIdentifier) return factor.safeIdentifier
  if (factor.strategy === "totp") return "your authenticator app"
  if (factor.strategy === "backup_code") return "your backup codes"
  return "Clerk"
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
