# CarCare - Car Repair Booking System

A web app where customers book car repairs at service centers, and an admin
manages centers, services and bookings.

Built with React, Vite, React Router and Supabase (database and admin login).

## Features

**Customers (no account, no sign-in)**

- Book a service: enter name, phone and car details, choose a service
  center, service, date and time
- Get a booking number on the confirmation page
- Track a booking with the booking number and phone number
- Cancel a booking while it is still pending

**Admin (signs in)**

- Dashboard with totals and the latest bookings
- View customers (everyone who has booked)
- Add and edit service centers
- Add and edit the services each center offers, with prices
- View all bookings, filter by status, update status and final cost

**Security**

- Only the admin has a login; the admin pages are blocked for everyone else
- Row Level Security in the database: visitors can only read the list of
  service centers and services. They cannot read customers, vehicles or
  bookings, and cannot write to any table directly
- Bookings are created, looked up and cancelled through three database
  functions that check every value. A booking can only be looked up or
  cancelled with both its number and the phone number used to make it

## Setup

1. Install the packages:

   ```
   npm install
   ```

2. Create a file named `.env` in the project folder (next to `package.json`)
   with your Supabase project's values. `.env.example` shows the format:

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_public_key
   ```

   Both values are in the Supabase dashboard under Project Settings -> API.
   Use the anon (public) key, never the service_role key.

3. Set up the database: open the Supabase dashboard -> SQL Editor, paste the
   whole of `supabase/schema.sql` and click Run. It is safe to run again.

4. Start the app:

   ```
   npm run dev
   ```

   Then open http://localhost:5173/

## Creating the admin

1. Supabase dashboard -> Authentication -> Users -> Add user. Enter an email
   and password and keep "Auto Confirm User" ticked.
2. Run this in the SQL Editor with that email:

   ```sql
   insert into public.profiles (id, full_name, email, role)
   select id, 'Admin', email, 'admin'
   from auth.users
   where email = 'your-email@example.com'
   on conflict (id) do update set role = 'admin';
   ```

The admin signs in at `/login` (the "Admin" link in the top bar).

## Project structure

```
supabase/
  schema.sql              Tables, booking functions and security rules
src/
  main.jsx                Starts the app
  App.jsx                 All the routes (pages and who can open them)
  index.css               Shared styles: buttons, forms, tables
  lib/
    supabase.js           Connection to Supabase
    format.js             Date, time and currency formatting
    constants.js          Booking statuses and fuel types
  hooks/
    useAsync.js           Loading / error / data handling for pages
  context/
    AuthContext.jsx       Whether an admin is signed in
  services/
    bookingService.js     Database calls for the public pages
    adminService.js       Database calls for the admin panel
    authService.js        Admin sign in and sign out
  components/             Reusable pieces (sidebar, top bar, forms, cards)
  pages/
    Home.jsx              Landing page
    BookService.jsx       Public booking form and confirmation
    TrackBooking.jsx      Public booking lookup and cancel
    Login.jsx             Admin sign in
    admin/                Dashboard, Customers, Service Centers, Services, Bookings
```

## Pages

| Address                  | Who      | What                           |
| ------------------------ | -------- | ------------------------------ |
| `/`                      | Everyone | Landing page                   |
| `/book`                  | Everyone | Book a service                 |
| `/track`                 | Everyone | Track or cancel a booking      |
| `/login`                 | Admin    | Admin sign in                  |
| `/admin`                 | Admin    | Dashboard                      |
| `/admin/customers`       | Admin    | Customer list                  |
| `/admin/service-centers` | Admin    | Manage service centers         |
| `/admin/services`        | Admin    | Manage services and prices     |
| `/admin/bookings`        | Admin    | Manage bookings                |

## How a booking flows

1. The admin adds a service center and its services.
2. A customer opens `/book`, fills in the form and gets a booking number.
   The booking starts as **pending**.
3. The admin opens Bookings, clicks Manage and sets it to **confirmed**,
   then **completed** with the final cost.
4. The customer sees each change on `/track`.
