import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react"
import { useAuth } from "@clerk/clerk-expo"

import { getUserRoles, type AppRole, type UserRoleRecord } from "@/services/supabase"
import * as storage from "@/utils/storage"

type RoleContextValue = {
  currentRole: AppRole | null
  activeRole: AppRole | null
  availableRoles: UserRoleRecord[]
  isLoadingRoles: boolean
  roleError: string | null
  hasRole: (role: AppRole) => boolean
  isMember: boolean
  isMerchant: boolean
  switchRole: (role: AppRole) => void
  selectRole: (role: AppRole) => void
  refreshRoles: () => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export const RoleProvider: FC<PropsWithChildren> = ({ children }) => {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth()
  const [availableRoles, setAvailableRoles] = useState<UserRoleRecord[]>([])
  const [activeRole, setActiveRole] = useState<AppRole | null>(null)
  const [isFetchingRoles, setIsFetchingRoles] = useState(false)
  const [loadedRolesForUserId, setLoadedRolesForUserId] = useState<string | null>(null)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const isLoadingRoles =
    !isLoaded ||
    (Boolean(isSignedIn && userId) && loadedRolesForUserId !== userId) ||
    isFetchingRoles

  const loadRoles = useEffectEvent(async () => {
    if (!isLoaded || !isSignedIn || !userId) {
      setAvailableRoles([])
      setActiveRole(null)
      setLoadedRolesForUserId(null)
      setIsFetchingRoles(false)
      return
    }

    try {
      setIsFetchingRoles(true)
      setRoleError(null)

      const roles = withDefaultMemberRole(await getUserRoles(() => getToken(), userId), userId)
      const persistedRole = storage.loadString(getRoleStorageKey(userId)) as AppRole | null
      const nextRole = resolveActiveRole(roles, persistedRole)

      setAvailableRoles(roles)
      setActiveRole(nextRole)
      setLoadedRolesForUserId(userId)

      if (nextRole) {
        storage.saveString(getRoleStorageKey(userId), nextRole)
      }
    } catch (error) {
      setAvailableRoles([])
      setActiveRole(null)
      setLoadedRolesForUserId(userId)
      setRoleError(getRoleErrorMessage(error))
    } finally {
      setIsFetchingRoles(false)
    }
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadRoles()
    }, 0)

    return () => clearTimeout(timeout)
  }, [isLoaded, isSignedIn, refreshKey, userId])

  const selectRole = (role: AppRole) => {
    const startedAt = getNow()

    if (!availableRoles.some((record) => record.role === role)) return

    setActiveRole(role)
    if (userId) {
      storage.saveString(getRoleStorageKey(userId), role)
    }

    logRoleTiming("selectRole", startedAt, { role })
  }

  const refreshRoles = () => setRefreshKey((value) => value + 1)
  const hasRole = (role: AppRole) => availableRoles.some((record) => record.role === role)

  return (
    <RoleContext.Provider
      value={{
        currentRole: activeRole,
        activeRole,
        availableRoles,
        isLoadingRoles,
        roleError,
        hasRole,
        isMember: activeRole === "member",
        isMerchant: activeRole === "merchant",
        switchRole: selectRole,
        selectRole,
        refreshRoles,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)

  if (!context) {
    throw new Error("useRole must be used within RoleProvider.")
  }

  return context
}

function getRoleStorageKey(userId: string) {
  return `roles.lastSelectedRole.${userId}`
}

function resolveActiveRole(roles: UserRoleRecord[], persistedRole: AppRole | null) {
  if (roles.length === 0) return null
  if (roles.length === 1) return roles[0]?.role ?? null
  if (persistedRole && roles.some((record) => record.role === persistedRole)) return persistedRole
  return null
}

function withDefaultMemberRole(roles: UserRoleRecord[], userId: string): UserRoleRecord[] {
  if (roles.length > 0) return roles

  const now = new Date().toISOString()

  return [
    {
      id: `default-member-${userId}`,
      clerk_user_id: userId,
      role: "member",
      is_active: true,
      metadata: { source: "mobile-default" },
      created_at: now,
      updated_at: now,
    },
  ]
}

function getRoleErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message)
  }

  return "Unable to load roles."
}

function getNow() {
  return globalThis.performance?.now?.() ?? Date.now()
}

function logRoleTiming(label: string, startedAt: number, details: Record<string, string>) {
  if (!__DEV__) return

  const duration = getNow() - startedAt
  console.info(`[perf][RoleProvider] ${label} ${duration.toFixed(1)}ms`, details)
}
