# 🛡️ CityHive2 – Auth & Permissions Setup Checklist

This document outlines the requirements and logic for enabling user authentication and role-based permissions using Supabase.

---

## 🔐 Supabase Auth Setup

- [ ] Enable **email/password** auth in the Supabase dashboard
- [ ] Configure redirect URLs (e.g., localhost for dev)
- [ ] Add login/signup UI to the app (modal or inline)

---

## 👤 User Profile Table

- [ ] Create `profiles` table:
  - `id` (UUID, matches `auth.users.id`)
  - `display_name` (optional)
  - `is_admin` (boolean, default `false`)
  - `created_at` (timestamp)
- [ ] Ensure new users get a `profiles` entry on sign-up (via trigger or client logic)

---

## 🧱 Marker Ownership & Permissions

- [ ] On marker creation, set `markers.user_id` = current user ID
- [ ] Apply RLS to `markers` table:
  - `SELECT`: ✅ all users
  - `INSERT`: ✅ if `auth.uid() = new.user_id`
  - `UPDATE`/`DELETE`: ✅ if `auth.uid() = markers.user_id` or `is_admin = true`
- [ ] (Optional) Apply similar RLS to `comments` table if needed

---

## 🧠 Admin Logic

- [ ] Add my Supabase UID to `profiles` with `is_admin = true`
- [ ] Update RLS to allow admins full access
- [ ] (Optional) Add admin UI elements for moderation or deletion

---

## 🖥️ Frontend Integration

- [ ] Handle `auth.onAuthStateChange`
- [ ] Display UI based on auth state:
  - Add Marker: ✅ logged-in users only
  - Edit/Delete: ✅ only for user's own markers
  - Comments: ✅ authenticated users only (optional)
- [ ] Provide login/signup prompts for restricted actions
- [ ] Add logout button and account name display

---

## ✅ Final Pre-Beta Checks

- [ ] Test:
  - [ ] Sign-up, login, and logout
  - [ ] Marker creation/edit by owner
  - [ ] Edit/delete blocked for other users
  - [ ] Admin override access
  - [ ] Read-only access for anonymous visitors
- [ ] Confirm RLS prevents unauthorized actions from backend/API

---

Once complete, CityHive2 is ready for **beta testing** with invited users.
