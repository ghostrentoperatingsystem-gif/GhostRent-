import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const HUB_HOME = {
  tenant: "/tenant",
  landlord: "/landlord",
  buyer: "/buyer",
};

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/choose-hub");

  redirect(HUB_HOME[profile.role] || "/choose-hub");
}
