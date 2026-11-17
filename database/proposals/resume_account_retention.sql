-- PROPOSAL ONLY. Not applied: the previous database-change request was cancelled.
-- Review and test in a rollback transaction before activation. Applies to new CV-only signups.
-- Existing portfolio administrators must never be deleted by this policy.
begin;
create table if not exists private.resume_accounts(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null);
alter table private.resume_accounts enable row level security;
revoke all on private.resume_accounts from public,anon,authenticated;
create or replace function private.register_resume_account() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.raw_user_meta_data->>'module'='resume-builder' then
  insert into private.resume_accounts(user_id,created_at) values(new.id,coalesce(new.created_at,now())) on conflict do nothing;
 end if;return new;
end $$;
revoke all on function private.register_resume_account() from public,anon,authenticated;
drop trigger if exists register_resume_account on auth.users;
create trigger register_resume_account after insert on auth.users for each row execute function private.register_resume_account();
create or replace function private.pin_resume_birth() returns trigger language plpgsql security definer set search_path='' as $$
declare born timestamptz;begin
 if auth.uid() is not null and auth.uid()<>new.user_id then raise exception 'Not your workspace';end if;
 if tg_op='UPDATE' then new.user_id:=old.user_id;new.created_at:=old.created_at;return new;end if;
 select created_at into born from private.resume_accounts where user_id=new.user_id;
 new.created_at:=coalesce(born,now());return new;
end $$;
revoke all on function private.pin_resume_birth() from public,anon,authenticated;
drop trigger if exists pin_resume_birth on public.cv_workspaces;
create trigger pin_resume_birth before insert or update on public.cv_workspaces for each row execute function private.pin_resume_birth();
alter policy cv_create on public.cv_workspaces with check(user_id=(select auth.uid()) and created_at+interval '60 days'>now());
alter policy cv_read on public.cv_workspaces using(user_id=(select auth.uid()) and created_at+interval '60 days'>now());
alter policy cv_edit on public.cv_workspaces using(user_id=(select auth.uid()) and created_at+interval '60 days'>now()) with check(user_id=(select auth.uid()) and created_at+interval '60 days'>now());
create or replace function private.purge_resume_accounts() returns void language plpgsql security definer set search_path='' as $$
begin
 delete from auth.sessions s using private.resume_accounts a where s.user_id=a.user_id and a.created_at+interval '90 days'<=now() and not exists(select 1 from public.admin_users ad where ad.user_id=a.user_id);
 delete from auth.refresh_tokens t using private.resume_accounts a where t.user_id=a.user_id::text and a.created_at+interval '90 days'<=now() and not exists(select 1 from public.admin_users ad where ad.user_id=a.user_id);
 delete from public.cv_workspaces where created_at+interval '90 days'<=now();
 delete from auth.users u using private.resume_accounts a where u.id=a.user_id and a.created_at+interval '90 days'<=now() and not exists(select 1 from public.admin_users ad where ad.user_id=a.user_id);
end $$;
revoke all on function private.purge_resume_accounts() from public,anon,authenticated;
select cron.schedule('cv-retention-cleanup','15 0 * * *','select private.purge_resume_accounts();');
commit;
-- Provider audit logs and backups have separate retention; this cannot promise immediate physical erasure.
