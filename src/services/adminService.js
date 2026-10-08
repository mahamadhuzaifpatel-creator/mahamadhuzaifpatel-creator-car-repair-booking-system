import { supabase } from "../lib/supabase";

export async function getAdminStats() {
  const [
    customersResult,
    vehiclesResult,
    serviceCentersResult,
    bookingsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),

    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("service_centers")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true }),
  ]);

  const errors = [
    customersResult.error,
    vehiclesResult.error,
    serviceCentersResult.error,
    bookingsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw errors[0];
  }

  return {
    customers: customersResult.count ?? 0,
    vehicles: vehiclesResult.count ?? 0,
    serviceCenters: serviceCentersResult.count ?? 0,
    bookings: bookingsResult.count ?? 0,
  };
}