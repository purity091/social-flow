-- =============================================
-- SocialFlow Database Schema for Supabase
-- =============================================

-- Posts table (linked to auth.users)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text,
  platform text not null,
  status text check (status in ('Draft', 'Scheduled', 'Published')) default 'Draft',
  date timestamp with time zone not null,
  image_url text,
  program_id text,
  program_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Campaigns table (linked to auth.users)
create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  color text default '#4f46e5',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Media items table (linked to auth.users)
create table public.media_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  url text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- Row Level Security (RLS) Policies
-- Users can only see and modify their own data
-- =============================================

alter table public.posts enable row level security;
alter table public.campaigns enable row level security;
alter table public.media_items enable row level security;

-- Posts policies
create policy "Users can view their own posts"
on public.posts for select
using (auth.uid() = user_id);

create policy "Users can insert their own posts"
on public.posts for insert
with check (auth.uid() = user_id);

create policy "Users can update their own posts"
on public.posts for update
using (auth.uid() = user_id);

create policy "Users can delete their own posts"
on public.posts for delete
using (auth.uid() = user_id);

-- Campaigns policies
create policy "Users can view their own campaigns"
on public.campaigns for select
using (auth.uid() = user_id);

create policy "Users can insert their own campaigns"
on public.campaigns for insert
with check (auth.uid() = user_id);

create policy "Users can update their own campaigns"
on public.campaigns for update
using (auth.uid() = user_id);

create policy "Users can delete their own campaigns"
on public.campaigns for delete
using (auth.uid() = user_id);

-- Media policies
create policy "Users can view their own media"
on public.media_items for select
using (auth.uid() = user_id);

create policy "Users can insert their own media"
on public.media_items for insert
with check (auth.uid() = user_id);

create policy "Users can update their own media"
on public.media_items for update
using (auth.uid() = user_id);

create policy "Users can delete their own media"
on public.media_items for delete
using (auth.uid() = user_id);

-- Design Studios table (linked to auth.users)
create table public.design_studios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  url text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.design_studios enable row level security;

-- Design Studios policies
create policy "Users can view their own studios"
on public.design_studios for select
using (auth.uid() = user_id);

create policy "Users can insert their own studios"
on public.design_studios for insert
with check (auth.uid() = user_id);

create policy "Users can update their own studios"
on public.design_studios for update
using (auth.uid() = user_id);

create policy "Users can delete their own studios"
on public.design_studios for delete
using (auth.uid() = user_id);

-- =============================================
-- Storage Bucket for Media (run in Storage settings)
-- =============================================
-- 1. Create a bucket named 'media'
-- 2. Set it to public (for image URLs)
-- 3. Add policy: authenticated users can upload
