-- Scheduled edge-function calls (previously created by hand in Lovable Cloud, never in a migration).
-- Needs two Vault secrets, created outside git because they are per-project:
--   select vault.create_secret('https://<ref>.supabase.co', 'project_url');
--   select vault.create_secret('<service_role JWT>', 'service_role_key');
-- Jobs are created INACTIVE. Activate them at cutover, once the old deployment's jobs are off:
--   select cron.alter_job(jobid, active := true) from cron.job where jobname like 'therizo-%';

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.invoke_edge_function(fn text, body jsonb default '{}'::jsonb)
returns bigint
language sql
security definer
set search_path = ''
as $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/' || fn,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := body,
    timeout_milliseconds := 60000
  );
$$;

revoke all on function public.invoke_edge_function(text, jsonb) from public, anon, authenticated;

do $$
declare
  j record;
begin
  for j in
    select * from (values
      ('therizo-analytics-digest-weekly',   '0 7 * * 1',  $c$select public.invoke_edge_function('analytics-digest', '{"scheduled":true}')$c$),
      ('therizo-indexnow-daily',            '0 6 * * *',  $c$select public.invoke_edge_function('indexnow')$c$),
      ('therizo-nurture-dispatch-hourly',   '15 * * * *', $c$select public.invoke_edge_function('nurture-dispatch', jsonb_build_object('triggered_at', now()))$c$),
      ('therizo-saved-search-alerts-daily', '0 9 * * *',  $c$select public.invoke_edge_function('saved-search-alerts?frequency=daily')$c$),
      ('therizo-saved-search-alerts-weekly','0 9 * * 1',  $c$select public.invoke_edge_function('saved-search-alerts?frequency=weekly')$c$)
    ) as t(name, schedule, command)
  loop
    perform cron.schedule(j.name, j.schedule, j.command);
    perform cron.alter_job(
      (select jobid from cron.job where jobname = j.name),
      active := false
    );
  end loop;
end $$;
