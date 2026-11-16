-- Run only AFTER platform.sql, as project owner. Fixtures are rolled back.
-- Does not access real authentication records or visitor emails.
begin;
insert into public.posts(id,title,slug,content,status,published_at) values
('00000000-0000-4000-8000-000000000101','SECURITY TEST published','security-test-published','Fixture','published',now()-interval '1 hour'),
('00000000-0000-4000-8000-000000000102','SECURITY TEST draft','security-test-draft','Fixture','draft',null),
('00000000-0000-4000-8000-000000000103','SECURITY TEST future','security-test-future','Fixture','published',now()+interval '1 day');
insert into public.comments(post_id,name,body,status) values
('00000000-0000-4000-8000-000000000101','Fixture approved','Visible fixture','approved'),
('00000000-0000-4000-8000-000000000101','Fixture pending','Hidden fixture','pending');
set local role anon;
select set_config('request.jwt.claims','{}',true);
-- Explicit assertions are isolated so one expected permission error cannot mask another test.
do $$ declare n integer; begin
 select count(*) into n from public.posts where slug like 'security-test-%';
 if n<>1 then raise exception 'FAIL: public article policy'; end if;
 select count(*) into n from public.comments where post_id='00000000-0000-4000-8000-000000000101';
 if n<>1 then raise exception 'FAIL: public moderation policy'; end if;
 select count(user_id) into n from public.admin_users;
 if n<>0 then raise exception 'FAIL: membership rows exposed'; end if;
 if public.is_site_admin() then raise exception 'FAIL: anonymous admin'; end if;
 begin
  insert into public.posts(title,slug,content) values('Attack','security-test-attack','Denied');
  raise exception 'FAIL: anonymous article insert allowed';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.comments(post_id,name,body,status) values('00000000-0000-4000-8000-000000000101','Attack','Denied','approved');
  raise exception 'FAIL: anonymous comment bypass allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform email from private.comment_contacts limit 1;
  raise exception 'FAIL: private contacts accessible';
 exception when insufficient_privilege then null; end;
 begin
  perform public.submit_engagement('{}'::jsonb,'forged');
  raise exception 'FAIL: privileged RPC accessible to visitor';
 exception when insufficient_privilege then null; end;
 raise notice 'Anonymous read/write/privacy checks passed';
end $$;
reset role;
rollback;
