export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type RacingTeamRegistration = {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  car_type: string
  car_description: string
  driving_experience: number
  package_id: string
  accept_terms: boolean
  payment_status: string
  subscription_id: string | null
  created_at: string | null
  updated_at: string | null
  locale: string | null
  welcome_email_sent: boolean | null
  payment_provider: "paypal" | "upayments" | string | null
  user_id_old: string | null
}

export type RacingTeamSubscription = {
  id: string
  registration_id: string
  paypal_subscription_id: string
  paypal_plan_id: string
  paypal_payer_id: string | null
  status: "pending" | "active" | "suspended" | "cancelled" | "expired" | string
  amount: number | string
  currency: string
  billing_cycle: string
  subscribed_at: string | null
  next_billing_date: string | null
  cancelled_at: string | null
  created_at: string | null
  updated_at: string | null
}

export type UpayLocalSubscription = {
  id: string
  module: string
  registration_id: string
  package_id: string | null
  user_id: string | null
  customer_email: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_unique_token: string | null
  default_card_token: string | null
  status: "pending" | "active" | "past_due" | "canceled" | "paused" | string
  amount: number | string
  currency: string
  billing_cycle: string
  subscribed_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  next_billing_date: string | null
  cancelled_at: string | null
  created_at: string | null
  updated_at: string | null
}

export type RacingTeamPackage = {
  id: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  paypal_plan_id: string | null
  price_usd: number | string
  billing_cycle: string
  features_en: Json
  features_ar: Json
  is_active: boolean
  display_order: number
  created_at: string | null
  updated_at: string | null
  paypal_product_id: string | null
  setup_fee: number | string | null
  price_kwd: number | string | null
  setup_fee_kwd: number | string | null
  payment_provider_options: string[]
  default_payment_provider: string
  upay_enabled: boolean
}

export type MembershipNews = {
  id: string
  title: string
  ar_title: string
  content: string
  ar_content: string
  date: string
  image_url: string | null
  type: string
  created_at: string
  is_active: boolean
  show_as_banner: boolean
  cta_url: string | null
  cta_label: string | null
  cta_label_ar: string | null
  priority: number
  published_at: string | null
  expires_at: string | null
}

export type MemberEvent = {
  id: string
  title: string
  ar_title: string
  description: string
  ar_description: string
  event_date: string
  location: string
  ar_location: string
  image_url: string | null
  attendees: number
  created_at: string
}

export type PartnerOffer = {
  id: string
  partner_name: string
  ar_partner_name: string
  offer_title: string
  ar_offer_title: string
  description: string
  ar_description: string
  discount: string
  code: string
  valid_until: string
  logo_url: string | null
  created_at: string
}

export type Sponsor = {
  id: string
  name: string
  icon: string
  created_at: string | null
  updated_at: string | null
  url: string | null
  is_active: boolean
  display_order: number
}

export type UserRole = {
  id: string
  clerk_user_id: string
  role: DatabaseAppRole
  is_active: boolean
  metadata: Json
  created_at: string
  updated_at: string
}

export type PushDevice = {
  id: string
  member_id: string
  platform: string
  one_signal_player_id: string
  app_version: string | null
  last_seen: string
  created_at: string
  updated_at: string
}

export type DatabaseAppRole = "member" | "merchant" | "admin" | "staff"

export type Database = {
  public: {
    Tables: {
      racing_team_registrations: {
        Row: RacingTeamRegistration
        Insert: Partial<RacingTeamRegistration>
        Update: Partial<RacingTeamRegistration>
        Relationships: []
      }
      racing_team_subscriptions: {
        Row: RacingTeamSubscription
        Insert: Partial<RacingTeamSubscription>
        Update: Partial<RacingTeamSubscription>
        Relationships: []
      }
      upay_local_subscriptions: {
        Row: UpayLocalSubscription
        Insert: Partial<UpayLocalSubscription>
        Update: Partial<UpayLocalSubscription>
        Relationships: []
      }
      racing_team_packages: {
        Row: RacingTeamPackage
        Insert: Partial<RacingTeamPackage>
        Update: Partial<RacingTeamPackage>
        Relationships: []
      }
      membership_news: {
        Row: MembershipNews
        Insert: Partial<MembershipNews>
        Update: Partial<MembershipNews>
        Relationships: []
      }
      member_events: {
        Row: MemberEvent
        Insert: Partial<MemberEvent>
        Update: Partial<MemberEvent>
        Relationships: []
      }
      partner_offers: {
        Row: PartnerOffer
        Insert: Partial<PartnerOffer>
        Update: Partial<PartnerOffer>
        Relationships: []
      }
      sponsors: {
        Row: Sponsor
        Insert: Partial<Sponsor>
        Update: Partial<Sponsor>
        Relationships: []
      }
      user_roles: {
        Row: UserRole
        Insert: Partial<UserRole>
        Update: Partial<UserRole>
        Relationships: []
      }
      push_devices: {
        Row: PushDevice
        Insert: Partial<PushDevice>
        Update: Partial<PushDevice>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
