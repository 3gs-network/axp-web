import { SiteLayout } from "@/components/layout/SiteLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
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
