import "./Welcome.css";
import { useSession } from "@/hooks/useSession";
import { LogOut } from "lucide-react";

export function Welcome() {
  const { user, signOut } = useSession();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <section className="dashboard-welcome section--navy">
      <div className="shell dashboard-welcome-row">
        <div>
          <p className="eyebrow eyebrow--gold">Your AXP account</p>
          <h1>Welcome back, {firstName}.</h1>
          <p className="dashboard-welcome-copy">Here's a snapshot of your homeownership journey with AXP.</p>
        </div>
        <button type="button" className="button button--glass" onClick={signOut}>
          Sign out <LogOut size={15} />
        </button>
      </div>
    </section>
  );
}
