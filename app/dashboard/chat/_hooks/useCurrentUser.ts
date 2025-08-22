// app/dashboard/chat/_hooks/useCurrentUser.ts
import { useState, useEffect } from 'react'
import { createClient } from '@/libs/supabase/client'
import { User } from '@supabase/supabase-js'

// useCurrentUser.ts
export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null)
    const supabase = createClient()
    
    useEffect(() => {
      const fetchCurrentUser = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      }
      fetchCurrentUser()
    }, [])
    
    return user
  }