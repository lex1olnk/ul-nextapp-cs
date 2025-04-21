DROP TABLE IF EXISTS 
    match_players,
    matches,
    players
CASCADE;

DROP TYPE IF EXISTS post_status CASCADE;
DROP SEQUENCE IF EXISTS users_id_seq, posts_id_seq, players_player_id_seq, matches_match_id_seq CASCADE;
