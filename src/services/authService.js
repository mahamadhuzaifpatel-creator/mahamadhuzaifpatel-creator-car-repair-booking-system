import { supabase } from "../lib/supabase";

async function checkIsAdmin(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role === "admin";
}

export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const isAdmin = await checkIsAdmin(data.user.id);

  if (!isAdmin) {
    await supabase.auth.signOut();
    throw new Error("This account does not have admin access.");
  }
}

export async function getAdminStatus() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session) {
    return false;
  }

  return checkIsAdmin(session.user.id);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}