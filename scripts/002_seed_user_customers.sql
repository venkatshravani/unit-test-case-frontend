-- Seed data for testing
-- User 1: shravani@sonata-software.com
-- User 2: venki@sonata-software.com

INSERT INTO public.user_customer_assignments (user_id, customer_account, customer_name)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'shravani@sonata-software.com'),
  'SSNA-0014',
  'Shravani Customer 1'
UNION ALL
SELECT 
  (SELECT id FROM auth.users WHERE email = 'shravani@sonata-software.com'),
  'SSNA-0021',
  'Shravani Customer 2'
UNION ALL
SELECT 
  (SELECT id FROM auth.users WHERE email = 'venki@sonata-software.com'),
  'SSNA-0005',
  'Venki Customer 1'
UNION ALL
SELECT 
  (SELECT id FROM auth.users WHERE email = 'venki@sonata-software.com'),
  'SSSG-0007',
  'Venki Customer 2'
ON CONFLICT DO NOTHING;
