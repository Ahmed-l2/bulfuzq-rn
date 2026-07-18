import { Tabs } from "expo-router"

import { DashboardBottomNav } from "@/components/dashboard"

export default function MemberTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <DashboardBottomNav {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "#000000" } }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="membership" options={{ title: "Membership" }} />
      <Tabs.Screen name="events" options={{ title: "Events" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  )
}
