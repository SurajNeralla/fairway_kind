"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = React.useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (userId: string, emailFallback?: string, metaFallback?: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch warning:', error.message);
        // Fallback profile if DB trigger delay
        setProfile({
          id: userId,
          email: emailFallback || '',
          full_name: (metaFallback?.full_name as string) || 'Fairway Golfer',
          role: ((metaFallback?.role as UserRole) || 'user'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchProfile(
            initialSession.user.id,
            initialSession.user.email,
            initialSession.user.user_metadata
          );
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(
          newSession.user.id,
          newSession.user.email,
          newSession.user.user_metadata
        );
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email, user.user_metadata);
    }
  };

  const role = profile?.role || (user?.user_metadata?.role as UserRole) || null;
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        isAdmin,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
