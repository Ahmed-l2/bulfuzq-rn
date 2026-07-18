import * as Linking from "expo-linking"
import { getStateFromPath, type LinkingOptions } from "@react-navigation/native"

import type { AppStackParamList } from "./navigationTypes"

const websitePrefixes = ["https://bulfuzq.com", "https://www.bulfuzq.com"]

const memberHomePaths = ["offers", "sponsors", "racing-team"]

export const linking: LinkingOptions<AppStackParamList> = {
  prefixes: [Linking.createURL("/"), "bulracing://", ...websitePrefixes],
  config: {
    screens: {
      SignIn: "",
      SignUp: "sign-up",
      RoleSelection: "roles",
      MemberTabs: {
        screens: {
          Account: "account",
          Events: "events",
          Home: "home",
          Membership: "membership",
        },
      },
      MembershipCard: "membership-card",
      Announcements: "news",
      AnnouncementDetail: "news/:id",
      MerchantHome: "merchant",
    },
  },
  getStateFromPath(path, options) {
    const normalizedPath = path.replace(/^\//, "")

    if (
      memberHomePaths.some(
        (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
      )
    ) {
      return {
        routes: [{ name: "MemberTabs", params: { screen: "Home" } }],
      }
    }

    return getStateFromPath(path, options)
  },
}
