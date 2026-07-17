/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { useAuth } from "@clerk/clerk-expo"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Config from "@/config"
import { AccountScreen } from "@/screens/AccountScreen"
import { AnnouncementDetailScreen } from "@/screens/AnnouncementDetailScreen"
import { AnnouncementsScreen } from "@/screens/AnnouncementsScreen"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { HomeScreen } from "@/screens/HomeScreen"
import { LoadingScreen } from "@/screens/LoadingScreen"
import { MembershipCardScreen } from "@/screens/MembershipCardScreen"
import { MerchantHomeScreen } from "@/screens/MerchantHomeScreen"
import { RoleSelectionScreen } from "@/screens/RoleSelectionScreen"
import { SignInScreen } from "@/screens/SignInScreen"
import { SignUpScreen } from "@/screens/SignUpScreen"
import { useRole } from "@/services/roles"
import { useAppTheme } from "@/theme/context"

import type { AppStackParamList, NavigationProps } from "./navigationTypes"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const { isLoaded, isSignedIn } = useAuth()
  const { activeRole, availableRoles, isLoadingRoles } = useRole()
  const {
    theme: { colors },
  } = useAppTheme()

  if (!isLoaded || (isSignedIn && isLoadingRoles)) return <LoadingScreen />

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {isSignedIn ? (
        getRoleScreens(activeRole, availableRoles.length)
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

function getRoleScreens(activeRole: ReturnType<typeof useRole>["activeRole"], roleCount: number) {
  if (!activeRole || roleCount === 0) {
    return <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
  }

  if (activeRole === "merchant") {
    return (
      <>
        <Stack.Screen name="MerchantHome" component={MerchantHomeScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
      </>
    )
  }

  if (activeRole !== "member") {
    return <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
  }

  return (
    <>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MembershipCard" component={MembershipCardScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
    </>
  )
}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  )
}
