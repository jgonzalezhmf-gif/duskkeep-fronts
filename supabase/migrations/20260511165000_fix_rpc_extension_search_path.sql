-- Duskkeep Fronts - fix de search_path para RPC autoritativas.
-- `digest()` vive en el schema `extensions` en Supabase local/remoto.
-- Las funciones security definer mantienen un search_path explicito.

alter function public.open_adventure_map_interaction(text, text)
set search_path = public, extensions, pg_temp;

alter function public.purchase_shop_offer(text, text, int)
set search_path = public, extensions, pg_temp;
