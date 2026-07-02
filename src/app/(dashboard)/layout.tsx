import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware has already verified the session with Supabase on this
  // request; reading it from the cookie here avoids a second network call.
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const user = session.user;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="md:fixed md:inset-y-0 md:left-0">
        <Sidebar email={user.email ?? ""} />
      </div>
      <main className="flex-1 md:ml-60">
        <div className="mx-auto w-full max-w-screen-xl p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
