import { supabase } from "../lib/supabase";

// Database calls for the public pages. No sign-in is needed for any of these.
// Bookings are created, looked up and cancelled through database functions
// (see supabase/schema.sql), so visitors never get direct access to the tables.

// The service centers and the services they offer, for the booking form.
export async function getBookingOptions() {
  const [centersResult, servicesResult] = await Promise.all([
    supabase
      .from("service_centers")
      .select("id, name, address, phone, opening_time, closing_time")
      .order("name", { ascending: true }),

    supabase
      .from("services")
      .select("id, service_center_id, name, description, price")
      .order("name", { ascending: true }),
  ]);

  const errors = [centersResult.error, servicesResult.error].filter(Boolean);

  if (errors.length > 0) {
    throw errors[0];
  }

  return {
    centers: centersResult.data ?? [],
    services: servicesResult.data ?? [],
  };
}

// Creates the booking and returns its booking number.
export async function createGuestBooking(booking) {
  const { data, error } = await supabase.rpc("create_guest_booking", {
    p_full_name: booking.fullName,
    p_phone: booking.phone,
    p_email: booking.email,
    p_registration_number: booking.registrationNumber,
    p_brand: booking.brand,
    p_model: booking.model,
    p_year: booking.year,
    p_fuel_type: booking.fuelType,
    p_service_center_id: booking.serviceCenterId,
    p_service_id: booking.serviceId,
    p_booking_date: booking.bookingDate,
    p_booking_time: booking.bookingTime,
    p_problem_description: booking.problemDescription,
  });

  if (error) {
    throw error;
  }

  return data;
}

// Finds a booking by its number and the phone number used to make it.
// Returns null when nothing matches.
export async function trackBooking(bookingId, phone) {
  const { data, error } = await supabase.rpc("track_booking", {
    p_booking_id: bookingId,
    p_phone: phone,
  });

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}

// Cancels a booking that is still pending.
export async function cancelGuestBooking(bookingId, phone) {
  const { error } = await supabase.rpc("cancel_guest_booking", {
    p_booking_id: bookingId,
    p_phone: phone,
  });

  if (error) {
    throw error;
  }
}
