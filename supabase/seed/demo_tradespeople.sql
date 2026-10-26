-- DEMO tradespeople, for testing "choose who comes" and automatic matching.
-- NOT real people. Every one is named "Demo …" and says so in their profile.
-- They cannot log in (no password) and their emails use the .invalid domain,
-- which never receives mail. Remove them before launch with
-- demo_tradespeople_remove.sql.
--
-- Creating the auth user runs the on_auth_user_created trigger, which makes
-- the profile, the provider profile and the three basic checks.

with demo (n, first, trades, postcode, about) as (
  values
    (1, 'Amira',  array['plumbing', 'heating'],     'SE15', 'Demo profile for testing. Not a real tradesperson. Plumbing and heating.'),
    (2, 'Ben',    array['electrical'],              'SW2',  'Demo profile for testing. Not a real tradesperson. Electrical work.'),
    (3, 'Chloe',  array['painting', 'carpentry'],   'N1',   'Demo profile for testing. Not a real tradesperson. Painting and carpentry.'),
    (4, 'Dev',    array['gas', 'heating'],          'E8',   'Demo profile for testing. Not a real tradesperson. Gas and boilers.'),
    (5, 'Ella',   array['handyman', 'carpentry'],   'SW9',  'Demo profile for testing. Not a real tradesperson. Handyman jobs.'),
    (6, 'Faisal', array['plumbing', 'painting'],    'SW2',  'Demo profile for testing. Not a real tradesperson. Plumbing and decorating.')
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       'demo+' || n || '@passionatetaskers.invalid', '', now(),
       '{"provider":"email","providers":["email"]}'::jsonb,
       jsonb_build_object('role', 'provider', 'full_name', 'Demo ' || first, 'phone', '00000 00000' || n, 'demo', true),
       now(), now(), '', '', '', ''
  from demo
 where not exists (select 1 from auth.users u where u.email = 'demo+' || n || '@passionatetaskers.invalid');

-- Fill in their trades and area, and approve them, as the team would.
with demo (n, trades, postcode, about) as (
  values
    (1, array['plumbing', 'heating'],   'SE15', 'Demo profile for testing. Not a real tradesperson. Plumbing and heating.'),
    (2, array['electrical'],            'SW2',  'Demo profile for testing. Not a real tradesperson. Electrical work.'),
    (3, array['painting', 'carpentry'], 'N1',   'Demo profile for testing. Not a real tradesperson. Painting and carpentry.'),
    (4, array['gas', 'heating'],        'E8',   'Demo profile for testing. Not a real tradesperson. Gas and boilers.'),
    (5, array['handyman', 'carpentry'], 'SW9',  'Demo profile for testing. Not a real tradesperson. Handyman jobs.'),
    (6, array['plumbing', 'painting'],  'SW2',  'Demo profile for testing. Not a real tradesperson. Plumbing and decorating.')
)
update public.provider_profiles pp
   set trades = d.trades,
       postcode = d.postcode,
       about = d.about,
       gas_safe = case when d.trades && array['gas', 'heating'] then '0000000' else '' end,
       electrical_scheme = case when 'electrical' = any (d.trades) then 'DEMO 000000' else '' end,
       onboarding_step = 3,
       onboarded_at = now(),
       status = 'approved',
       updated_at = now()
  from demo d
  join auth.users u on u.email = 'demo+' || d.n || '@passionatetaskers.invalid'
 where pp.id = u.id;

-- The register checks their trades need, then every check approved.
insert into public.provider_checks (provider_id, kind)
select pp.id, k.kind
  from public.provider_profiles pp
  join auth.users u on u.id = pp.id and u.email like 'demo+%@passionatetaskers.invalid'
  cross join lateral (
    select 'gas-safe' as kind where pp.trades && array['gas', 'heating']
    union all
    select 'electrical' where 'electrical' = any (pp.trades)
  ) k
on conflict (provider_id, kind) do nothing;

update public.provider_checks c
   set status = 'approved', note = 'Demo: not a real check', expires_on = current_date + 365, updated_at = now()
  from auth.users u
 where u.id = c.provider_id and u.email like 'demo+%@passionatetaskers.invalid';
