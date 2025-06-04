# Supabase Migrations

This directory contains SQL migrations for the Supabase database.

## Fixing Row Level Security (RLS) Policies

The file `fix_rls_policies.sql` contains SQL commands to fix Row Level Security policies for the `products` and `categories` tables.

### How to Apply the Migration

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Go to the "SQL Editor" section in the left sidebar
4. Create a new query
5. Copy and paste the contents of the `fix_rls_policies.sql` file into the SQL editor
6. Click "Run" to execute the SQL commands

### What This Migration Does

This migration:

1. Enables Row Level Security on the `products` and `categories` tables
2. Drops any existing policies to avoid conflicts
3. Creates new policies that allow anonymous access for SELECT, INSERT, UPDATE, and DELETE operations

**Note**: The policies in this migration allow anonymous access, which is suitable for development and testing. For a production environment, you should implement more restrictive policies that require authentication and proper authorization.

### For Production Use

For a production environment, consider replacing the anonymous policies with ones that require authentication:

```sql
-- Example of a policy that only allows authenticated users to insert records
CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

Or policies that restrict operations to specific users:

```sql
-- Example of a policy that only allows users to edit their own records
CREATE POLICY "Allow users to update own records" ON products
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
``` 