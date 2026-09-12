-- One private notebook per authenticated user. Updates use an atomic revision
-- check so simultaneous devices cannot silently overwrite each other's work.
create table if not exists public.decant_notebooks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notebook jsonb not null check (jsonb_typeof(notebook) = 'object'),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.decant_notebooks enable row level security;
revoke all on public.decant_notebooks from anon, authenticated;
grant select, insert, update on public.decant_notebooks to authenticated;
create policy "Read own notebook" on public.decant_notebooks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own notebook" on public.decant_notebooks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own notebook" on public.decant_notebooks
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.decant_notebook_revision()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;
create trigger decant_notebook_revision before update on public.decant_notebooks
for each row execute function public.decant_notebook_revision();
