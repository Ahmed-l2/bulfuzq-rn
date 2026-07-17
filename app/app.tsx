/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}
import "./utils/gestureHandler"

import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import * as WebBrowser from "expo-web-browser"
import { ClerkProvider } from "@clerk/clerk-expo"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { env, hasClerkPublishableKey } from "./config/env"
import { initI18n } from "./i18n"
import { AppNavigator } from "./navigators/AppNavigator"
import { linking } from "./navigators/linking"
import { useNavigationPersistence } from "./navigators/navigationUtilities"
import { MissingAuthConfigScreen } from "./screens/MissingAuthConfigScreen"
import { clerkTokenCache } from "./services/auth/clerkTokenCache"
import { NotificationBootstrap } from "./services/notifications"
import { AppQueryProvider } from "./services/query"
import { RoleProvider } from "./services/roles"
import { ThemeProvider } from "./theme/context"
import { customFontsToLoad } from "./theme/typography"
import { loadDateFnsLocale } from "./utils/formatDate"
import * as storage from "./utils/storage"

WebBrowser.maybeCompleteAuthSession()

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!isNavigationStateRestored || !isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return null
  }

  if (!hasClerkPublishableKey) {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <ThemeProvider>
            <MissingAuthConfigScreen />
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    )
  }

  // otherwise, we're ready to render the app
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <ClerkProvider publishableKey={env.clerkPublishableKey ?? ""} tokenCache={clerkTokenCache}>
          <AppQueryProvider>
            <RoleProvider>
              <ThemeProvider>
                <NotificationBootstrap />
                <AppNavigator
                  linking={linking}
                  initialState={initialNavigationState}
                  onStateChange={onNavigationStateChange}
                />
              </ThemeProvider>
            </RoleProvider>
          </AppQueryProvider>
        </ClerkProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}
