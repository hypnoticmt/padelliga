// components/AdminGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/sign-in");
        return;
      }

      const { data: profile } = await supabase
        .from("players")
        .select("is_admin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.is_admin) {
        setIsAdmin(true);
      } else {
        router.replace("/protected/"); // non-admin → redirect to dashboard
      }

      setIsChecking(false);
    };

    checkAdmin();
  }, [router]);

  if (isChecking) {
    return <p className="text-center mt-10">Checking admin permissions...</p>;
  }

  return <>{isAdmin && children}</>;
}
