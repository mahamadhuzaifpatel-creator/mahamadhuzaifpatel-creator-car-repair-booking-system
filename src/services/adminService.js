import { supabase } from "../lib/supabase";

// The columns and linked records shown for a booking in the admin panel.
const BOOKING_SELECT = `
  id,
  booking_date,
  booking_time,
  status,
  problem_description,
  estimated_cost,
  final_cost,
  created_at,
  customer:profiles!customer_id ( full_name, email, phone ),
  vehicle:vehicles!vehicle_id ( registration_number, brand, model ),
  service_center:service_centers!service_center_id ( name ),
  service:services!service_id ( name )
`;

/* ---------- Dashboard ---------- */

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

    supabase.from("vehicles").select("*", { count: "exact", head: true }),

    supabase
      .from("service_centers")
      .select("*", { count: "exact", head: true }),

    supabase.from("bookings").select("*", { count: "exact", head: true }),
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

export async function getRecentBookings(limit = 5) {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

/* ---------- Customers ---------- */

export async function getCustomers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/* ---------- Service centers ---------- */

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

export async function createServiceCenter(center) {
  const { data, error } = await supabase
    .from("service_centers")
    .insert(center)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateServiceCenter(id, center) {
  const { data, error } = await supabase
    .from("service_centers")
    .update(center)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* ---------- Services ---------- */

export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("id, service_center_id, name, description, price")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createService(service) {
  const { data, error } = await supabase
    .from("services")
    .insert(service)
    .select("id, service_center_id, name, description, price")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateService(id, service) {
  const { data, error } = await supabase
    .from("services")
    .update(service)
    .eq("id", id)
    .select("id, service_center_id, name, description, price")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* ---------- Bookings ---------- */

export async function getBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

// Used by the admin to change a booking's status and final cost.
export async function updateBooking(id, values) {
  const { data, error } = await supabase
    .from("bookings")
    .update(values)
    .eq("id", id)
    .select(BOOKING_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
