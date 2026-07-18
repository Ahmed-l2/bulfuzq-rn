import { ComponentProps } from "react"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native"
import { NavigationContainer } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

export type MemberTabParamList = {
  Home: undefined
  Membership: undefined
  Events: undefined
  Account: undefined
}

// App Stack Navigator types
export type AppStackParamList = {
  SignIn: undefined
  SignUp: undefined
  RoleSelection: undefined
  MemberTabs: NavigatorScreenParams<MemberTabParamList> | undefined
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

export type MemberTabScreenProps<T extends keyof MemberTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MemberTabParamList, T>,
  NativeStackScreenProps<AppStackParamList>
>

export interface NavigationProps extends Partial<
  ComponentProps<typeof NavigationContainer<AppStackParamList>>
> {}
