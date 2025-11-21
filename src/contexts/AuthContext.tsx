import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  subscription: any;
  clientLimit: number;
  clientCount: number;
  isAdmin: boolean;
  isDemoAccount: boolean;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [clientLimit, setClientLimit] = useState(3);
  const [clientCount, setClientCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemoAccount, setIsDemoAccount] = useState(false);
  const navigate = useNavigate();

  const fetchSubscription = async (userId: string) => {
    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    const adminStatus = !!roleData;
    setIsAdmin(adminStatus);

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setSubscription(data);

    // Get client limit (admins get unlimited, free = 3, paid = 10 + addons)
    let limit = 3;
    if (adminStatus) {
      limit = 999999;
    } else if (data?.pricing_tier === "free") {
      limit = 3;
    } else if (data?.pricing_tier === "early_bird" || data?.pricing_tier === "regular") {
      const addonPacks = data?.addon_client_packs || 0;
      limit = 10 + (addonPacks * 5);
    }
    setClientLimit(limit);

    // Get current client count
    const { count } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setClientCount(count || 0);
  };

  const syncSubscriptionFromStripe = async (userId: string) => {
    try {
      // Ask backend to verify latest subscription directly with Stripe
      await supabase.functions.invoke('verify-subscription');
    } catch (error) {
      console.error('Error syncing subscription from Stripe', error);
    } finally {
      // Always refresh from database afterwards
      await fetchSubscription(userId);
    }
  };

  useEffect(() => {
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsDemoAccount(session?.user?.email === 'demo@clientkey.com');

        if (session?.user) {
          setTimeout(() => {
            syncSubscriptionFromStripe(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsDemoAccount(session?.user?.email === 'demo@clientkey.com');

      if (session?.user) {
        syncSubscriptionFromStripe(session.user.id);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password
    });
    
    if (!error && rememberMe) {
      // Store preference for 30-day persistence
      localStorage.setItem('rememberMe', 'true');
    }
    
    if (!error) {
      navigate("/dashboard");
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (!error) {
      // Create free subscription for new user
      setTimeout(async () => {
        await supabase.functions.invoke("create-free-subscription");
      }, 0);
      navigate("/dashboard");
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscription(null);
    localStorage.removeItem('rememberMe');
    navigate("/auth");
  };

  const refreshSubscription = async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signIn,
        signUp,
        signOut,
        subscription,
        clientLimit,
        clientCount,
        isAdmin,
        isDemoAccount,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
