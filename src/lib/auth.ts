import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type UserRole = "admin" | "analyst" | "manager"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: UserProfile | null
}

// Get the current authenticated user with their profile
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return {
    id: user.id,
    email: user.email!,
    profile: profile as UserProfile | null,
  }
}

// Check if user has one of the required roles
export function hasRole(user: AuthUser | null, allowedRoles: UserRole[]): boolean {
  if (!user?.profile) return false
  return allowedRoles.includes(user.profile.role)
}

// Require authentication - redirects to login if not authenticated
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  return user
}

// Require specific roles - redirects to unauthorized if not allowed
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!hasRole(user, allowedRoles)) {
    redirect("/unauthorized")
  }
  
  return user
}

// Sign out the current user
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

// Role-based page access configuration
export const rolePermissions: Record<string, UserRole[]> = {
  "/dashboard": ["admin", "analyst", "manager"],
  "/admin": ["admin"],
  "/reports": ["admin", "analyst", "manager"],
  "/settings": ["admin", "manager"],
  "/users": ["admin"],
}

// Check if a path is accessible by a role
export function canAccessPath(path: string, role: UserRole): boolean {
  // Check exact match first
  if (rolePermissions[path]) {
    return rolePermissions[path].includes(role)
  }
  
  // Check parent paths
  const pathParts = path.split("/").filter(Boolean)
  for (let i = pathParts.length; i > 0; i--) {
    const parentPath = "/" + pathParts.slice(0, i).join("/")
    if (rolePermissions[parentPath]) {
      return rolePermissions[parentPath].includes(role)
    }
  }
  
  // Default: allow access if no specific permission is defined
  return true
}
