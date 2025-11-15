# Database Migration: Email Existence Check

## Setup Instructions

To enable email existence checking during signup, you need to create a PostgreSQL function in your Supabase database.

### Steps:

1. **Open Supabase Dashboard**

   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration**

   - Copy the contents of `check_email_exists.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the SQL

3. **Verify the Function**
   - The function `check_email_exists` should now be available
   - It can be called from your client code via `supabase.rpc()`

### What This Does:

- Creates a PostgreSQL function that checks if an email exists in the `auth.users` table
- The function is marked as `SECURITY DEFINER` to allow access to the `auth.users` table
- Grants execute permissions to both `anon` and `authenticated` roles
- Returns `true` if the email exists, `false` otherwise

### Security Note:

This function uses `SECURITY DEFINER` which means it runs with the privileges of the function creator (typically a superuser). This is necessary to access the `auth.users` table, which is not directly accessible to regular users. The function only performs a read operation and doesn't expose any sensitive data beyond whether an email exists.
