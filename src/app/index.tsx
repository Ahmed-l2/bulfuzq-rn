import { Redirect } from "expo-router"
import { useAuth } from "@clerk/clerk-expo"

import { LoadingScreen } from "@/screens/LoadingScreen"
import { useRole } from "@/services/roles"

export default function IndexRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  const { activeRole, availableRoles, isLoadingRoles } = useRole()

  if (!isLoaded || (isSignedIn && isLoadingRoles)) return <LoadingScreen />
  if (!isSignedIn) return <Redirect href="/sign-in" />
  if (!activeRole || availableRoles.length === 0) return <Redirect href="/roles" />
  if (activeRole === "merchant") return <Redirect href="/merchant" />
  if (activeRole !== "member") return <Redirect href="/roles" />

  return <Redirect href="/(member)/(tabs)" />
}
