begin;
do $test$
declare pid uuid:=gen_random_uuid(); v uuid:=gen_random_uuid(); result jsonb; ident text:=md5(gen_random_uuid()::text)||md5(gen_random_uuid()::text);
begin
 insert into public.posts(id,title,slug,excerpt,content,status,published_at,category)
 select pid,'Isolated transaction test','isolated-reaction-test-'||pid::text,'Temporary test','Temporary test','published',now()-interval '1 hour',category from public.posts limit 1;
 if not found then raise exception 'Fixture not created'; end if;
 result:=public.submit_engagement(jsonb_build_object('post_id',pid,'kind','like','visitor',v),ident);
 if result->'stats' is distinct from '{"likes":1,"useful":0}'::jsonb then raise exception 'Initial count failed: %',result; end if;
 result:=public.submit_engagement(jsonb_build_object('post_id',pid,'kind','like','visitor',v),ident);
 if result->'stats' is distinct from '{"likes":1,"useful":0}'::jsonb then raise exception 'Duplicate count failed: %',result; end if;
 result:=public.submit_engagement(jsonb_build_object('post_id',pid,'kind','useful','visitor',v),ident);
 if result->'stats' is distinct from '{"likes":1,"useful":1}'::jsonb then raise exception 'Useful count failed: %',result; end if;
 result:=public.submit_engagement(jsonb_build_object('post_id',pid,'kind','like','visitor',gen_random_uuid()),ident);
 if result->'stats' is distinct from '{"likes":2,"useful":1}'::jsonb then raise exception 'Second browser count failed: %',result; end if;
 update public.posts set status='draft' where id=pid;
 begin
  perform public.submit_engagement(jsonb_build_object('post_id',pid,'kind','like','visitor',gen_random_uuid()),ident);
  raise exception 'Draft guard failed';
 exception when others then if SQLERRM <> 'Article unavailable' then raise; end if;
 end;
 if has_function_privilege('anon','public.submit_engagement(jsonb,text)','execute') or has_function_privilege('authenticated','public.submit_engagement(jsonb,text)','execute') then raise exception 'Privileged RPC exposed'; end if;
end $test$;
rollback;
select 'PASS: isolated transaction fixture; counts 1/0, dedup 1/0, useful 1/1, second visitor 2/1, draft rejection and privileged-RPC permissions. All test writes rolled back.' as result;