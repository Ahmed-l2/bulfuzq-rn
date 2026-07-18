import { Redirect, Stack } from "expo-router"
import { useAuth } from "@clerk/clerk-expo"

import { LoadingScreen } from "@/screens/LoadingScreen"
import { useRole } from "@/services/roles"

export default function MemberLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoadingRoles } = useRole()

  if (!isLoaded || (isSignedIn && isLoadingRoles)) return <LoadingScreen />
  if (isLoaded && !isSignedIn) return <Redirect href="/sign-in" />

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: "#000000" }, headerShown: false }} />
  )
}
