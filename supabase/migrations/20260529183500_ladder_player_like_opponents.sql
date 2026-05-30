-- Ladder opponents should feel like simulated player commanders, not campaign
-- or Arena PVE encounters. This migration keeps the existing reward/MMR rules
-- but swaps active Bronze opponents to player-like Frontline presets and adds
-- extra same-division variants for matchmaking variety.

insert into public.server_ladder_opponents (
  opponent_id,
  season_id,
  enabled,
  league,
  division,
  preset_id,
  display_name,
  points_win,
  points_draw,
  points_loss,
  power,
  notes
)
values
  ('ladder_bronze_iii_iron_vow', 'alpha_s1', true, 'bronze', 'iii', 'ladder_bronze_iii_iron_vow', 'Iron Vow', 25, 5, -10, 105, 'Bronze III player-like balanced commander'),
  ('ladder_bronze_iii_candle_warden', 'alpha_s1', true, 'bronze', 'iii', 'ladder_bronze_iii_candle_warden', 'Candle Warden', 25, 5, -10, 108, 'Bronze III player-like defensive sustain commander'),
  ('ladder_bronze_iii_mistbound_recruit', 'alpha_s1', true, 'bronze', 'iii', 'ladder_bronze_iii_mistbound_recruit', 'Mistbound Recruit', 25, 5, -10, 112, 'Bronze III player-like fast archer commander'),
  ('ladder_bronze_ii_ash_squire', 'alpha_s1', true, 'bronze', 'ii', 'ladder_bronze_ii_ash_squire', 'Ash Squire', 25, 5, -10, 135, 'Bronze II player-like pressure commander'),
  ('ladder_bronze_ii_gate_hound', 'alpha_s1', true, 'bronze', 'ii', 'ladder_bronze_ii_gate_hound', 'Gate Hound', 25, 5, -10, 140, 'Bronze II player-like tank healer commander'),
  ('ladder_bronze_ii_thorn_signal', 'alpha_s1', true, 'bronze', 'ii', 'ladder_bronze_ii_thorn_signal', 'Thorn Signal', 25, 5, -10, 145, 'Bronze II player-like rally control commander'),
  ('ladder_bronze_i_dusk_knight', 'alpha_s1', true, 'bronze', 'i', 'ladder_bronze_i_dusk_knight', 'Dusk Knight', 25, 5, -10, 165, 'Bronze I player-like sustain pressure commander'),
  ('ladder_bronze_i_raven_bannerman', 'alpha_s1', true, 'bronze', 'i', 'ladder_bronze_i_raven_bannerman', 'Raven Bannerman', 25, 5, -10, 172, 'Bronze I player-like burst control commander'),
  ('ladder_bronze_i_oath_ember', 'alpha_s1', true, 'bronze', 'i', 'ladder_bronze_i_oath_ember', 'Oath Ember', 25, 5, -10, 178, 'Bronze I player-like aggressive blade commander')
on conflict (opponent_id) do update set
  season_id = excluded.season_id,
  enabled = excluded.enabled,
  league = excluded.league,
  division = excluded.division,
  preset_id = excluded.preset_id,
  display_name = excluded.display_name,
  points_win = excluded.points_win,
  points_draw = excluded.points_draw,
  points_loss = excluded.points_loss,
  power = excluded.power,
  notes = excluded.notes;
