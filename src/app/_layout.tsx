/* eslint-disable import/first */
if (__DEV__) {
  require("@/devtools/ReactotronConfig.ts")
}
import "@/utils/gestureHandler"

import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { ClerkProvider } from "@clerk/clerk-expo"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { env, hasClerkPublishableKey } from "@/config/env"
import { initI18n } from "@/i18n"
import { MissingAuthConfigScreen } from "@/screens/MissingAuthConfigScreen"
import { clerkTokenCache } from "@/services/auth/clerkTokenCache"
import { NotificationBootstrap } from "@/services/notifications"
import { AppQueryProvider } from "@/services/query"
import { RoleProvider } from "@/services/roles"
import { ThemeProvider } from "@/theme/context"
import { customFontsToLoad } from "@/theme/typography"
import { loadDateFnsLocale } from "@/utils/formatDate"

WebBrowser.maybeCompleteAuthSession()

export default function RootLayout() {
  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  if (!isI18nInitialized || (!areFontsLoaded && !fontLoadError)) return null

  if (!hasClerkPublishableKey) {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <ThemeProvider initialContext="dark">
            <MissingAuthConfigScreen />
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <ClerkProvider publishableKey={env.clerkPublishableKey ?? ""} tokenCache={clerkTokenCache}>
          <AppQueryProvider>
            <RoleProvider>
              <ThemeProvider initialContext="dark">
                <NotificationBootstrap />
                <Stack screenOptions={{ headerShown: false }} />
              </ThemeProvider>
            </RoleProvider>
          </AppQueryProvider>
        </ClerkProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}
