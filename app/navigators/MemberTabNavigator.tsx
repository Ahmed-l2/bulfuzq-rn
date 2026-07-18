import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import { DashboardBottomNav } from "@/components/dashboard"
import { AccountScreen } from "@/screens/AccountScreen"
import { EventsScreen } from "@/screens/EventsScreen"
import { HomeScreen } from "@/screens/HomeScreen"
import { MembershipScreen } from "@/screens/MembershipScreen"

import type { MemberTabParamList } from "./navigationTypes"

const Tab = createBottomTabNavigator<MemberTabParamList>()

export function MemberTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <DashboardBottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Membership" component={MembershipScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  )
}
