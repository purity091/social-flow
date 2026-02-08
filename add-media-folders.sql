-- =============================================
-- Media Library Folders & Dimensions Update
-- =============================================

-- 1. Create media_folders table
create table if not exists public.media_folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  parent_id uuid references public.media_folders(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add new columns to media_items table
alter table public.media_items
add column if not exists folder_id uuid references public.media_folders(id) on delete set null,
add column if not exists width integer,
add column if not exists height integer,
add column if not exists file_size bigint;

-- 3. Enable RLS on media_folders
alter table public.media_folders enable row level security;

-- 4. Create policies for media_folders
create policy "Users can view their own folders"
on public.media_folders for select
using (auth.uid() = user_id);

create policy "Users can insert their own folders"
on public.media_folders for insert
with check (auth.uid() = user_id);

create policy "Users can update their own folders"
on public.media_folders for update
using (auth.uid() = user_id);

create policy "Users can delete their own folders"
on public.media_folders for delete
using (auth.uid() = user_id);

-- 5. Create index for faster folder queries
create index if not exists idx_media_folders_user_id on public.media_folders(user_id);
create index if not exists idx_media_folders_parent_id on public.media_folders(parent_id);
create index if not exists idx_media_items_folder_id on public.media_items(folder_id);
