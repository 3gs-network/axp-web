import { SiteLayout } from "@/components/layout/SiteLayout";
import { RequireAuth } from "@/components/auth/route-guards";
import { Welcome } from "./sections/Welcome";
import { Overview } from "./sections/Overview";

export function DashboardPage() {
  return (
    <RequireAuth>
      <SiteLayout>
        <Welcome />
        <Overview />
      </SiteLayout>
    </RequireAuth>
  );
}
