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
export async function getCustomers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer");

  if (error) {
    throw error;
  }

  return data ?? [];
}
export async function getServiceCenters() {
  const { data, error } = await supabase
    .from("service_centers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_date,
      booking_time,
      status,
      estimated_cost,
      final_cost,
      created_at,
      customer:profiles!customer_id ( full_name, email ),
      vehicle:vehicles!vehicle_id ( registration_number, brand, model ),
      service_center:service_centers!service_center_id ( name )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
export async function getRecentBookings(limit = 5) {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_date,
      status,
      customer:profiles!customer_id ( full_name ),
      service_center:service_centers!service_center_id ( name )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}
