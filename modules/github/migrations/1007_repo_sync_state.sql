CREATE TABLE repo_sync_state (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL DEFAULT '{}',
  last_run_at timestamptz,
  last_ok_at  timestamptz,
  error       text
);
