/*
  # Cleanup Duplicate RLS Policies

  ## Overview
  Remove duplicate admin policies that were created before the security fix migration.
  Keep the policies created by the security fix migration.

  ## Changes
  Drop older duplicate policies with "Only admins can..." naming convention.
  Retain the newer "Admins can..." policies from the security fix.
*/

-- Drop duplicate policies for planned_holidays
DROP POLICY IF EXISTS "Only admins can insert holidays" ON planned_holidays;
DROP POLICY IF EXISTS "Only admins can update holidays" ON planned_holidays;
DROP POLICY IF EXISTS "Only admins can delete holidays" ON planned_holidays;

-- Drop duplicate policies for price_list
DROP POLICY IF EXISTS "Only admins can insert prices" ON price_list;
DROP POLICY IF EXISTS "Only admins can update prices" ON price_list;
DROP POLICY IF EXISTS "Only admins can delete prices" ON price_list;

-- Drop duplicate policies for team_members
DROP POLICY IF EXISTS "Only admins can insert team members" ON team_members;
DROP POLICY IF EXISTS "Only admins can update team members" ON team_members;
DROP POLICY IF EXISTS "Only admins can delete team members" ON team_members;
