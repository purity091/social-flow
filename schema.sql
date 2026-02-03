
-- Create tables

create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  platform text not null,
  status text check (status in ('Draft', 'Scheduled', 'Published')),
  date timestamp with time zone not null,
  image_url text,
  program_id text,
  program_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  color text default '#4f46e5',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.media_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- For a simple single-user app or public demo, we might enable public access, 
-- but for a real app, you'd want authenticated access.
-- Here we will enable public access for simplicity of the "post-planning" local tool context 
-- assuming the user will configure policies in Supabase dashboard if needed.

alter table public.posts enable row level security;
alter table public.campaigns enable row level security;
alter table public.media_items enable row level security;

create policy "Allow public read-write on posts"
on public.posts
for all
using (true)
with check (true);

create policy "Allow public read-write on campaigns"
on public.campaigns
for all
using (true)
with check (true);

create policy "Allow public read-write on media_items"
on public.media_items
for all
using (true)
with check (true);
