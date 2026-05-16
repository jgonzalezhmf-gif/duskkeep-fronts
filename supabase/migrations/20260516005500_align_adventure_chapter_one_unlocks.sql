-- Duskkeep Fronts - align Chapter 1 Adventure unlock graph.
-- Keeps server-authoritative requirements consistent with the visible map.

update public.server_adventure_battle_nodes
set required_node_ids = array['c1l3'],
    unlock_node_ids = array['c1l5'],
    updated_at = now()
where node_id = 'c1l4';

update public.server_adventure_battle_nodes
set required_node_ids = array['c1l7'],
    unlock_node_ids = array['c1l9'],
    updated_at = now()
where node_id = 'c1l8';

update public.server_adventure_battle_nodes
set unlock_node_ids = array['c1l3', 'c1l7'],
    updated_at = now()
where node_id = 'c1l2';
