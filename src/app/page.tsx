import { redirect } from "next/navigation";

// Middleware sends authenticated users to /dashboard.
export default function Home() {
  redirect("/login");
}
