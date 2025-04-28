// app/dashboard/chat/_hooks/useCurrentUser.ts
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'

// useCurrentUser.ts
export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null)
    const supabase = createClientComponentClient()
    
    useEffect(() => {
      const fetchCurrentUser = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      }
      fetchCurrentUser()
    }, [])
    
    return user
  }