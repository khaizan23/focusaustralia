"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function LogoutButton() {
  async function handleLogout() {
    await supabase.auth.signOut()
    
    // I-clear ang cookie
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    window.location.href = "/login"
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  )
}