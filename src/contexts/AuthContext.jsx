import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseReady } from '@/lib/supabaseClient';

const AuthContext = createContext();

const ROLE_LEVELS = {
  member: 1,
  secretary: 2,
  admin: 3,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const getFallbackName = (authUser) => {
  if (!authUser) return 'Usuario';
  const metaName = authUser.user_metadata?.full_name || authUser.user_metadata?.name;
  if (metaName) return metaName;
  if (authUser.email) return authUser.email.split('@')[0];
  return 'Usuario';
};

const mapUser = (authUser, profile) => {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || getFallbackName(authUser),
    role: profile?.role || 'member',
  };
};

const loadProfile = async (authUser) => {
  if (!authUser || !isSupabaseReady) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, email')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('Falha ao carregar perfil', error);
      return null;
    }

    if (data) return data;

    const payload = {
      id: authUser.id,
      email: authUser.email,
      name: getFallbackName(authUser),
      role: 'member',
    };

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert(payload)
      .select('id, name, role, email')
      .single();

    if (insertError) {
      console.error('Falha ao criar perfil', insertError);
      return payload;
    }

    return inserted || payload;
  } catch (error) {
    console.error('Falha ao carregar perfil', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!isSupabaseReady) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;
      if (!isMounted) return;

      if (sessionUser) {
        const profile = await loadProfile(sessionUser);
        if (!isMounted) return;
        setUser(mapUser(sessionUser, profile));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    init();

    if (!isSupabaseReady) return () => {};

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        const sessionUser = session?.user;
        if (sessionUser) {
          const profile = await loadProfile(sessionUser);
          if (!isMounted) return;
          setUser(mapUser(sessionUser, profile));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (!isSupabaseReady) {
      return { success: false, error: 'Supabase nao configurado.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const sessionUser = data?.user;
    if (sessionUser) {
      const profile = await loadProfile(sessionUser);
      setUser(mapUser(sessionUser, profile));
    }

    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseReady) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!user || !isSupabaseReady) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, email')
      .eq('id', user.id)
      .maybeSingle();

    if (error) return null;

    if (data) {
      setUser((prev) =>
        prev ? { ...prev, name: data.name || prev.name, role: data.role || prev.role } : prev
      );
    }

    return data;
  };

  const roleLevel = ROLE_LEVELS[user?.role] || 0;

  const value = {
    user,
    loading,
    login,
    logout,
    refreshProfile,
    isAdmin: user?.role === 'admin',
    isSecretary: user?.role === 'secretary',
    isManager: user?.role === 'admin' || user?.role === 'secretary',
    isMember: ['member', 'secretary', 'admin'].includes(user?.role),
    roleLevel,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
