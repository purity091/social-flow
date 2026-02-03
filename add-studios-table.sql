-- =============================================
-- إضافة جدول استديوهات التصميم (شغّل هذا فقط)
-- =============================================

-- Design Studios table (linked to auth.users)
create table if not exists public.design_studios (
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
