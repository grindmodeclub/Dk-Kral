/*
  # Fix Security Issues

  ## 1. Overview
  This migration addresses critical security vulnerabilities identified in the security audit:
  - RLS policies that allow unrestricted access to authenticated users
  - Leaked password protection disabled

  ## 2. RLS Policy Changes
  ### Tables Affected:
  - `planned_holidays` - Admin-only management operations
  - `price_list` - Admin-only management operations  
  - `team_members` - Admin-only management operations

  ### Security Model:
  - Public users (anon/authenticated): READ-ONLY access
  - Admin users: FULL access (INSERT, UPDATE, DELETE)
  - Admin identification: via `is_admin` flag in auth.jwt() app_metadata

  ### Policies Replaced:
  For each table, the following insecure policies are dropped:
  - "Authenticated users can insert [table]" - was allowing any authenticated user
  - "Authenticated users can update [table]" - was allowing any authenticated user  
  - "Authenticated users can delete [table]" - was allowing any authenticated user

  New restrictive policies check for admin role before allowing modifications.

  ## 3. Auth Configuration
  - Enable leaked password protection via HaveIBeenPwned integration

  ## 4. Important Notes
  - After migration, you must set `is_admin: true` in app_metadata for admin users
  - Use Supabase Dashboard or Auth API to set app_metadata
  - Example: Update user's app_metadata to include `{"is_admin": true}`
  - Auth connection strategy must be configured in Supabase Dashboard (Settings > Database > Connection Pooling)
*/

-- =====================================================
-- PART 1: Drop Insecure RLS Policies
-- =====================================================

-- Drop insecure policies for planned_holidays
DROP POLICY IF EXISTS "Authenticated users can insert holidays" ON planned_holidays;
DROP POLICY IF EXISTS "Authenticated users can update holidays" ON planned_holidays;
DROP POLICY IF EXISTS "Authenticated users can delete holidays" ON planned_holidays;

-- Drop insecure policies for price_list
DROP POLICY IF EXISTS "Authenticated users can insert prices" ON price_list;
DROP POLICY IF EXISTS "Authenticated users can update prices" ON price_list;
DROP POLICY IF EXISTS "Authenticated users can delete prices" ON price_list;

-- Drop insecure policies for team_members
DROP POLICY IF EXISTS "Authenticated users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can update team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can delete team members" ON team_members;

-- =====================================================
-- PART 2: Create Secure Admin-Only RLS Policies
-- =====================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure policies for planned_holidays
CREATE POLICY "Admins can insert holidays"
  ON planned_holidays FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update holidays"
  ON planned_holidays FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete holidays"
  ON planned_holidays FOR DELETE
  TO authenticated
  USING (is_admin());

-- Secure policies for price_list
CREATE POLICY "Admins can insert prices"
  ON price_list FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update prices"
  ON price_list FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete prices"
  ON price_list FOR DELETE
  TO authenticated
  USING (is_admin());

-- Secure policies for team_members
CREATE POLICY "Admins can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- PART 3: Enable Leaked Password Protection
-- =====================================================

-- Enable HaveIBeenPwned password checking
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'auth' AND tablename = 'config'
  ) THEN
    INSERT INTO auth.config (parameter, value)
    VALUES ('security_password_hibp_enabled', 'true')
    ON CONFLICT (parameter) 
    DO UPDATE SET value = 'true';
  END IF;
END $$;
