import { ComponentProps } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

// App Stack Navigator types
export type AppStackParamList = {
  SignIn: undefined
  SignUp: undefined
  RoleSelection: undefined
  Home: undefined
  MembershipCard: undefined
  Announcements: undefined
  AnnouncementDetail: { id: string }
  MerchantHome: undefined
  Account: undefined
}

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export interface NavigationProps extends Partial<
  ComponentProps<typeof NavigationContainer<AppStackParamList>>
> {}
