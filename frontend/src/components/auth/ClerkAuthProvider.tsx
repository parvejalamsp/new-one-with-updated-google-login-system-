import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";

interface ClerkConfig {
  enabled: boolean;
  publishable_key: string;
  proxy_url: string;
}

const appearance = {
  variables: {
    colorPrimary: "#2563eb",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#ffffff",
    colorForeground: "#0f172a",
    colorInput: "#ffffff",
    colorInputForeground: "#0f172a",
    colorBorder: "#e2e8f0",
    fontFamily: "Instrument Sans Variable, sans-serif",
    borderRadius: "0.875rem",
  },
};

export default function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const config = useQuery({
    queryKey: ["clerk-config"],
    queryFn: () => apiGet<ClerkConfig>("/clerk/config"),
    retry: 20,
    retryDelay: 1500,
  });

  if (config.isPending) {
    return <div className="grid min-h-screen place-items-center bg-slate-50" data-testid="auth-loading-state"><div className="text-center"><RefreshCw className="mx-auto size-6 animate-spin text-blue-600" /><p className="mt-3 text-sm font-semibold text-slate-500">Securing your collectFlow session…</p></div></div>;
  }
  if (config.isError || !config.data?.enabled) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 px-4" data-testid="auth-unavailable-state"><div className="max-w-md rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><ShieldAlert className="mx-auto size-10 text-amber-500" /><h1 className="mt-5 font-heading text-2xl font-extrabold text-slate-950">Sign-in is unavailable right now.</h1><p className="mt-3 text-sm leading-6 text-slate-500">The demo workspace remains protected. Retry the secure connection or return to the public site.</p><div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center"><button onClick={() => config.refetch()} className="min-h-11 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white" data-testid="auth-retry-button">Retry sign-in</button><button onClick={() => navigate("/")} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600" data-testid="auth-return-home-button">Return home</button></div></div></div>;
  }

  return <ClerkProvider
    publishableKey={config.data.publishable_key}
    proxyUrl={config.data.proxy_url || undefined}
    appearance={appearance}
    routerPush={(to) => navigate(to)}
    routerReplace={(to) => navigate(to, { replace: true })}
    signInUrl="/login"
    signUpUrl="/login"
    signInFallbackRedirectUrl="/app"
    signUpFallbackRedirectUrl="/app"
    afterSignOutUrl="/"
  >{children}</ClerkProvider>;
}