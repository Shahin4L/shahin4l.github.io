-- Applied to the connected project. CREATE OR REPLACE preserves existing service-only execution grants.
CREATE OR REPLACE FUNCTION public.submit_engagement(payload jsonb, identity_hash text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare pid uuid; cid uuid; parent uuid; k text; n integer; begin
-- This endpoint is executable ONLY by service_role, after Edge validation.
perform pg_advisory_xact_lock(hashtextextended(identity_hash,0));
delete from private.abuse_events where created_at<now()-interval '1 day';
perform pg_advisory_xact_lock(8675309);
select count(*) into n from private.abuse_events;
if n>=2000 then raise exception 'Daily engagement limit reached'; end if;
select count(*) into n from private.abuse_events where created_at>now()-interval '1 minute';
if n>=60 then raise exception 'Busy. Please try later.'; end if;
select count(*) into n from private.abuse_events where abuse_events.identity_hash=submit_engagement.identity_hash and created_at>now()-interval '10 minutes';
if n>=8 then raise exception 'Too many requests. Try again in ten minutes.'; end if;
pid:=(payload->>'post_id')::uuid;
if not exists(select 1 from public.posts where id=pid and status='published' and published_at<=now()) then raise exception 'Article unavailable'; end if;
k:=payload->>'kind';
if k='comment' then
 select count(*) into n from private.abuse_events where kind='comment';
 if n>=200 then raise exception 'Daily comment limit reached'; end if;
 if not exists(select 1 from public.posts where id=pid and comments_enabled) then raise exception 'Comments disabled'; end if;
 if length(trim(payload->>'name')) not between 1 and 80 or length(trim(payload->>'body')) not between 3 and 3000 or length(payload->>'email')>254 or (payload->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Invalid comment'; end if;
 parent:=nullif(payload->>'parent_id','')::uuid;
 if parent is not null and not exists(select 1 from public.comments where id=parent and post_id=pid and status='approved') then raise exception 'Reply unavailable'; end if;
 insert into public.comments(post_id,parent_id,name,body,website) values(pid,parent,trim(payload->>'name'),trim(payload->>'body'),nullif(payload->>'website','')) returning id into cid;
 insert into private.comment_contacts values(cid,lower(trim(payload->>'email')));
else
 if k not in ('like','useful') then raise exception 'Invalid reaction'; end if;
 perform pg_advisory_xact_lock(hashtextextended(pid::text,0));
 insert into private.reactions values(pid,(payload->>'visitor')::uuid,k) on conflict do nothing;
 insert into public.article_stats(post_id,likes,useful) select pid,count(*) filter(where kind='like'),count(*) filter(where kind='useful') from private.reactions where post_id=pid on conflict(post_id) do update set likes=excluded.likes,useful=excluded.useful;
end if;
insert into private.abuse_events(identity_hash,kind) values(identity_hash,k);
return jsonb_build_object('ok',true,'status',case when k='comment' then 'pending' else 'saved' end) || case when k='comment' then '{}'::jsonb else jsonb_build_object('stats',(select jsonb_build_object('likes',s.likes,'useful',s.useful) from public.article_stats s where s.post_id=pid)) end;
end $function$
