"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (!token || !userParam) {
      // Missing params — something went wrong
      router.replace("/account/login?error=oauth_failed");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));

      // Save to auth store (same as normal login)
      setUser(user, token);

      // Set auth_status cookie for middleware (non-httpOnly)
      const maxAge = 7 * 24 * 60 * 60;
      document.cookie = `auth_status=1; Max-Age=${maxAge}; path=/; SameSite=Lax`;
      if (user.role) {
        document.cookie = `auth_role=${encodeURIComponent(user.role)}; Max-Age=${maxAge}; path=/; SameSite=Lax`;
      }

      // Redirect to account page or saved redirect
      const redirectTo =
        sessionStorage.getItem("oauth_redirect") || "/account";
      sessionStorage.removeItem("oauth_redirect");
      router.replace(redirectTo);
    } catch {
      router.replace("/account/login?error=oauth_failed");
    }
  }, [searchParams, setUser, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        Đang hoàn tất đăng nhập...
      </p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OAuthCallbackHandler />
    </Suspense>
  );
}
