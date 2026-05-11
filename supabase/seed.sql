-- Seed de referencia para Supabase.
-- El alpha mantiene los datos jugables en /data/*.ts y las migraciones
-- seguras no dependen todavia de datos seed. Este archivo no debe bloquear
-- `supabase start` ni `supabase db reset` cuando el schema legacy no exista.

do $$
begin
  if to_regclass('public.adventure_chapters') is not null then
    insert into public.adventure_chapters (id, name)
    values (1, 'The Eclipse Rising')
    on conflict (id) do nothing;
  else
    raise notice 'Skipping legacy adventure_chapters seed; table does not exist in secure migrations.';
  end if;
end;
$$;

-- Usar los seeds TypeScript como fuente funcional durante el alpha.
-- Cuando activemos persistencia online, exportar seeds estables con un
-- script dedicado en lugar de duplicarlos manualmente aqui.

-- Jugador demo opcional para schema legacy:
-- insert into players (id, name) values ('00000000-0000-0000-0000-000000000001','Demo') on conflict do nothing;
