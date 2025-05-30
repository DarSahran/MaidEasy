import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sendOtp: (identifier: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<{ success: boolean; userExists: boolean; needsProfile: boolean }>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  createProfile: (profile: any) => Promise<boolean>;
  setUserSession: (userData: any) => void;
  pendingIdentifier: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingIdentifier, setPendingIdentifier] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const sendOtp = async (identifier: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setPendingIdentifier(identifier);
      
      // For now, always return success (static OTP system)
      console.log(`Static OTP sent to: ${identifier}`);
      return true;
    } catch (error) {
      console.error('Send OTP error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string): Promise<{ success: boolean; userExists: boolean; needsProfile: boolean }> => {
    try {
      setIsLoading(true);
      
      // Check if OTP is correct (static OTP: 000000)
      if (otp !== '000000') {
        return { success: false, userExists: false, needsProfile: false };
      }

      // Check if user exists in Supabase
      const isEmail = pendingIdentifier.includes('@');
      let userExists = false;
      
      if (isEmail) {
        // Check by email in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, phone')
          .eq('email', pendingIdentifier)
          .maybeSingle();
        
        userExists = !!data && !error;
        
        if (userExists) {
          // Create a session for existing user
          setUser({
            id: data.id,
            email: pendingIdentifier,
            phone: data.phone,
            user_metadata: {
              displayName: data.name,
            },
          } as any);
        }
      } else {
        // Check by phone in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, phone')
          .eq('phone', `+91${pendingIdentifier}`)
          .maybeSingle();
        
        userExists = !!data && !error;
        
        if (userExists) {
          // Create a session for existing user
          setUser({
            id: data.id,
            email: data.email,
            phone: `+91${pendingIdentifier}`,
            user_metadata: {
              displayName: data.name,
            },
          } as any);
        }
      }

      return { 
        success: true, 
        userExists, 
        needsProfile: !userExists 
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, userExists: false, needsProfile: false };
    } finally {
      setIsLoading(false);
    }
  };

  const setUserSession = (userData: any) => {
    setUser(userData);
  };

  const createProfile = async (profile: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const userId = generateUUID();
      const isEmail = pendingIdentifier.includes('@');
      
      const profileData = {
        id: userId,
        name: profile.name,
        email: isEmail ? pendingIdentifier : (profile.email || null),
        phone: isEmail ? null : `+91${pendingIdentifier}`,
        created_at: new Date().toISOString(),
      };

      console.log('Creating profile with data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        return false;
      }

      // Set user session immediately after creating profile
      const newUser = {
        id: data.id,
        email: profileData.email,
        phone: profileData.phone,
        user_metadata: {
          displayName: profileData.name,
        },
        aud: 'authenticated',
        role: 'authenticated',
      };
      
      setUser(newUser as any);
      setPendingIdentifier('');
      
      console.log('Profile created and user session set:', newUser);
      return true;
    } catch (error) {
      console.error('Profile creation error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      return !error;
    } catch (error) {
      console.error('Google sign in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setPendingIdentifier('');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        sendOtp,
        verifyOtp,
        signInWithGoogle,
        signOut,
        createProfile,
        setUserSession,
        pendingIdentifier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
