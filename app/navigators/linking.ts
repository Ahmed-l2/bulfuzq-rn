import * as Linking from "expo-linking"
import { getStateFromPath, type LinkingOptions } from "@react-navigation/native"

import type { AppStackParamList } from "./navigationTypes"

const websitePrefixes = ["https://bulfuzq.com", "https://www.bulfuzq.com"]

const memberHomePaths = ["events", "offers", "news", "sponsors", "membership", "racing-team"]

export const linking: LinkingOptions<AppStackParamList> = {
  prefixes: [Linking.createURL("/"), "bulracing://", ...websitePrefixes],
  config: {
    screens: {
      SignIn: "",
      SignUp: "sign-up",
      RoleSelection: "roles",
      Home: "home",
      MerchantHome: "merchant",
      Account: "account",
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
        routes: [{ name: "Home" }],
      }
    }

    return getStateFromPath(path, options)
  },
}
