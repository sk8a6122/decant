begin;
create table if not exists public.decant_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check(username ~ '^[a-z0-9_]{3,24}$'),
 display_name text not null default '' check(length(display_name)<=80),
 visibility text not null default 'private' check(visibility in ('private','friends','public'))
);
create table if not exists public.decant_friendships (
 sender uuid references auth.users(id) on delete cascade,
 recipient uuid references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted')),
 primary key(sender,recipient),check(sender<>recipient)
);
create unique index if not exists decant_friend_pair on public.decant_friendships(least(sender,recipient),greatest(sender,recipient));
create table if not exists public.decant_blocks (
 owner uuid references auth.users(id) on delete cascade,
 target uuid references auth.users(id) on delete cascade,
 primary key(owner,target),check(owner<>target)
);
create table if not exists public.decant_private_entries (
 owner uuid references auth.users(id) on delete cascade,
 entry_id text not null,primary key(owner,entry_id)
);
alter table public.decant_profiles enable row level security;
alter table public.decant_friendships enable row level security;
alter table public.decant_blocks enable row level security;
alter table public.decant_private_entries enable row level security;
revoke all on public.decant_profiles,public.decant_friendships,public.decant_blocks,public.decant_private_entries from anon,authenticated;

-- All access is through this bounded RPC. Never return the underlying notebook.
create or replace function public.decant_social(action text, target text default '', payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 me uuid:=auth.uid(); other_id uuid; profile public.decant_profiles;
 is_friend boolean:=false; is_blocked boolean:=false; entries jsonb:='[]'::jsonb;
 result jsonb; item jsonb; shared jsonb; mode text;
begin
 if action not in ('view','home','profile','lookup','request','accept','decline','cancel','remove','block','unblock','entry') then raise exception 'Unknown action'; end if;
 if action<>'view' and me is null then raise exception 'Please sign in first'; end if;
 if action='profile' then
  mode:=coalesce(payload->>'visibility','private');
  insert into public.decant_profiles(user_id,username,display_name,visibility)
  values(me,lower(trim(payload->>'username')),trim(coalesce(payload->>'display_name','')),mode)
  on conflict(user_id) do update set username=excluded.username,display_name=excluded.display_name,visibility=excluded.visibility;
 elsif action='entry' then
  if coalesce(payload->>'entry_id','')='' then raise exception 'Choose an entry'; end if;
  if coalesce((payload->>'private')::boolean,true) then
   insert into public.decant_private_entries values(me,payload->>'entry_id') on conflict do nothing;
  else delete from public.decant_private_entries where owner=me and entry_id=payload->>'entry_id'; end if;
 end if;
 if action in ('home','profile','entry') then
  return jsonb_build_object(
   'profile',(select to_jsonb(p)-'user_id' from public.decant_profiles p where user_id=me),
   'friends',coalesce((select jsonb_agg(jsonb_build_object('username',p.username,'display_name',p.display_name,'status',f.status,'incoming',f.recipient=me)) from public.decant_friendships f join public.decant_profiles p on p.user_id=case when f.sender=me then f.recipient else f.sender end where (f.sender=me or f.recipient=me) and not exists(select 1 from public.decant_blocks b where (b.owner=me and b.target=p.user_id) or (b.owner=p.user_id and b.target=me))),'[]'::jsonb),
   'blocked',coalesce((select jsonb_agg(jsonb_build_object('username',p.username,'display_name',p.display_name)) from public.decant_blocks b join public.decant_profiles p on p.user_id=b.target where b.owner=me),'[]'::jsonb),
   'private_entries',coalesce((select jsonb_agg(entry_id) from public.decant_private_entries where owner=me),'[]'::jsonb));
 end if;
 select * into profile from public.decant_profiles where username=lower(trim(target));
 other_id:=profile.user_id;
 if other_id is null then
  if action in ('view','lookup') then return jsonb_build_object('unavailable',true); end if;
  raise exception 'Profile not found';
 end if;
 select exists(select 1 from public.decant_blocks where (owner=me and public.decant_blocks.target=other_id) or (owner=other_id and public.decant_blocks.target=me)) into is_blocked;
 if action='unblock' then delete from public.decant_blocks where owner=me and public.decant_blocks.target=other_id; return '{}'::jsonb; end if;
 if action='block' then
  if other_id=me then raise exception 'Choose another person'; end if;
  insert into public.decant_blocks values(me,other_id) on conflict do nothing;
  delete from public.decant_friendships where (sender=me and recipient=other_id) or (sender=other_id and recipient=me);
  return '{}'::jsonb;
 end if;
 if is_blocked then
  if action in ('view','lookup') then return jsonb_build_object('unavailable',true); end if;
  raise exception 'This connection is unavailable';
 end if;
 select exists(select 1 from public.decant_friendships where status='accepted' and ((sender=me and recipient=other_id) or (sender=other_id and recipient=me))) into is_friend;
 if action='lookup' then return jsonb_build_object('username',profile.username,'display_name',profile.display_name,'self',other_id=me,'friend',is_friend); end if;
 if action='view' then
  if other_id=me or profile.visibility='public' or (profile.visibility='friends' and is_friend) then
   for item in select value from public.decant_notebooks n cross join lateral jsonb_array_elements(coalesce(n.notebook->'records','[]'::jsonb)) where n.user_id=other_id loop
    if item->>'kind' not in ('bottle','note') then continue; end if;
    if exists(select 1 from public.decant_private_entries where owner=other_id and entry_id=item->>'id') then continue; end if;
    -- Lesson reflections and hosting records are never published.
    if item->>'kind'='note' and (item->'data'->>'noteType'='lesson' or coalesce(item->'data'->>'lessonId','')<>'' or item->'data'->>'name' like 'Reflection:%') then continue; end if;
    shared:=jsonb_build_object('kind',item->>'kind','name',item->'data'->>'name','producer',item->'data'->>'producer','vintage',item->'data'->>'vintage','style',item->'data'->>'style','grape',coalesce(item->'data'->>'grape',item->'data'->>'varietal'),'region',item->'data'->>'region');
    if item->>'kind'='note' then shared:=shared||jsonb_build_object('rating',item->'data'->'rating','date',item->'data'->>'date','note',item->'data'->>'note'); end if;
    entries:=entries||jsonb_build_array(shared);
   end loop;
  end if;
  return jsonb_build_object('username',profile.username,'display_name',profile.display_name,'visibility',profile.visibility,'can_view',other_id=me or profile.visibility='public' or (profile.visibility='friends' and is_friend),'entries',entries);
 end if;
 if other_id=me then raise exception 'Choose another person'; end if;
 if not exists(select 1 from public.decant_profiles where user_id=me) then raise exception 'Create your profile first'; end if;
 if action='request' then insert into public.decant_friendships values(me,other_id,'pending') on conflict do nothing;
 elsif action='accept' then update public.decant_friendships set status='accepted' where sender=other_id and recipient=me and status='pending';
 elsif action='decline' then delete from public.decant_friendships where sender=other_id and recipient=me and status='pending';
 elsif action='cancel' then delete from public.decant_friendships where sender=me and recipient=other_id and status='pending';
 elsif action='remove' then delete from public.decant_friendships where (sender=me and recipient=other_id) or (sender=other_id and recipient=me);
 end if;
 return '{}'::jsonb;
end;
$$;
revoke all on function public.decant_social(text,text,jsonb) from public;
grant execute on function public.decant_social(text,text,jsonb) to anon,authenticated;
commit;
