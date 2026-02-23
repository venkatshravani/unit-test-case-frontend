-- Create test users in Supabase Auth
-- Note: These users need to be created via the Supabase Dashboard or Auth API
-- For now, we'll document the test credentials

-- Test User 1:
-- Email: shravani@sonata-software.com
-- Password: TestPassword123!

-- Test User 2:
-- Email: venki@sonata-software.com
-- Password: TestPassword123!

-- After users are created, assign them customers using this SQL:
-- Insert customer assignments for Shravani
INSERT INTO public.user_customer_assignments (user_id, customer_account, assigned_date)
SELECT id, 'SSNA-0014', NOW() FROM auth.users WHERE email = 'shravani@sonata-software.com'
ON CONFLICT (user_id, customer_account) DO NOTHING;

INSERT INTO public.user_customer_assignments (user_id, customer_account, assigned_date)
SELECT id, 'SSNA-0021', NOW() FROM auth.users WHERE email = 'shravani@sonata-software.com'
ON CONFLICT (user_id, customer_account) DO NOTHING;

-- Insert customer assignments for Venki
INSERT INTO public.user_customer_assignments (user_id, customer_account, assigned_date)
SELECT id, 'SSSG-0007', NOW() FROM auth.users WHERE email = 'venki@sonata-software.com'
ON CONFLICT (user_id, customer_account) DO NOTHING;

INSERT INTO public.user_customer_assignments (user_id, customer_account, assigned_date)
SELECT id, 'OB-00022', NOW() FROM auth.users WHERE email = 'venki@sonata-software.com'
ON CONFLICT (user_id, customer_account) DO NOTHING;
