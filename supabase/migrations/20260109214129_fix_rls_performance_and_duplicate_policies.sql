/*
  # Fix RLS Performance and Duplicate Policies

  ## 1. Overview
  This migration addresses the following security and performance issues:
  - RLS policies that re-evaluate auth functions for each row (causing performance degradation)
  - Multiple permissive policies on the same tables
  - Function search_path security issue

  ## 2. Changes

  ### Performance Optimization
  - Fix `is_admin()` function to use `(select auth.jwt())` instead of `auth.jwt()` directly
  - Set stable search_path for `is_admin()` function to prevent security vulnerabilities
  - Fix `admin_users` table policy to use `(select auth.uid())` instead of `auth.uid()` directly

  ### Duplicate Policy Cleanup
  Drop duplicate SELECT policies for:
  - `planned_holidays` table - Remove "Public can read active holidays" (keeping "Anyone can view holidays")
  - `price_list` table - Remove "Public can read prices" (keeping "Anyone can view prices")
  - `team_members` table - Remove "Public can read team members" (keeping "Anyone can view team members")

  ## 3. Security Impact
  - Improved query performance by avoiding function re-evaluation per row
  - Eliminated policy conflicts from multiple permissive policies
  - Fixed function search_path vulnerability
  - Maintains same access control (public read, admin write)

  ## 4. Configuration Notes (Manual Action Required)
  The following issues require manual configuration in Supabase Dashboard:
  - **Auth DB Connection Strategy**: Change from fixed (10) to percentage-based in Settings > Database > Connection Pooling
  - **Leaked Password Protection**: Enable in Settings > Authentication > Security
*/

-- =====================================================
-- PART 1: Fix is_admin() Function
-- =====================================================

-- Recreate is_admin() function with optimized auth.jwt() call and stable search_path
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    ((select auth.jwt()) -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, auth;

-- =====================================================
-- PART 2: Fix admin_users Policy
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can read own admin status" ON admin_users;

-- Recreate with optimized auth.uid() call
CREATE POLICY "Users can read own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- PART 3: Remove Duplicate SELECT Policies
-- =====================================================

-- Drop duplicate policy for planned_holidays
-- Keep "Anyone can view holidays" (public role) which covers anon and authenticated
DROP POLICY IF EXISTS "Public can read active holidays" ON planned_holidays;

-- Drop duplicate policy for price_list
-- Keep "Anyone can view prices" (public role) which covers anon and authenticated
DROP POLICY IF EXISTS "Public can read prices" ON price_list;

-- Drop duplicate policy for team_members
-- Keep "Anyone can view team members" (public role) which covers anon and authenticated
DROP POLICY IF EXISTS "Public can read team members" ON team_members;
