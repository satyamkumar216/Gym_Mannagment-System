import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white overflow-x-hidden max-w-[100vw]">
      <SiteHeader />
      <main className={`flex-1 ${!isHome ? "pt-24" : ""}`}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
