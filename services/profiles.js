import { createClient } from "@/lib/supabase";

export async function getMyProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not logged in") };

  return supabase.from("profiles").select("*").eq("id", user.id).single();
}

export async function setHubRole(role) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not logged in") };

  return supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();
}

export async function updateProfile(fields) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Not logged in") };

  return supabase
    .from("profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();
}
