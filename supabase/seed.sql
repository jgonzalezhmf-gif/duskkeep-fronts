-- Reference seed for Supabase. The app ships with the same data inline
-- in /data/*.ts. This file exists so that enabling the Supabase backend
-- is a plug-in operation, not a rewrite.

-- Chapters
insert into adventure_chapters (id, name)
values (1, 'The Eclipse Rising')
on conflict (id) do nothing;

-- Use the TS seed files as the authoritative source; mirror here when
-- switching persistence mode by running: node scripts/export-seed.mjs (todo).

-- Minimal demo player (optional)
-- insert into players (id, name) values ('00000000-0000-0000-0000-000000000001','Demo') on conflict do nothing;
