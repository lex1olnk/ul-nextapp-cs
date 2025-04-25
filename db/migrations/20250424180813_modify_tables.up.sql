-- Создание таблицы игроков
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    UL_rating FLOAT DEFAULT 0.0,
    nickname VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы матчей
CREATE TABLE matches (
    match_id SERIAL PRIMARY KEY,
    rounds INTEGER NOT NULL,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы статистики игроков в матчах
CREATE TABLE match_players (
    match_id INTEGER NOT NULL REFERENCES matches(match_id),
    player_id INTEGER NOT NULL REFERENCES players(player_id),
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    headshots INTEGER DEFAULT 0,
    exchanged INTEGER DEFAULT 0,
    firstdeaths INTEGER DEFAULT 0,
    firstkills INTEGER DEFAULT 0,
    damage INTEGER DEFAULT 0,
    multi_kills INTEGER[5] DEFAULT ARRAY[0,0,0,0,0],
    clutches INTEGER[5] DEFAULT ARRAY[0,0,0,0,0],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (match_id, player_id)
);

-- Создание индексов
CREATE INDEX idx_multikills ON match_players USING GIN(multi_kills);
CREATE INDEX idx_clutches ON match_players USING GIN(clutches);

ALTER TABLE match_players 
ADD COLUMN KASTScore FLOAT DEFAULT 0.0;


-- 1. Создание таблицы турниров
CREATE TABLE ul_tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE ul_tournaments IS 'Таблица турниров Upper League';

-- 2. Модификация таблицы matches
ALTER TABLE matches 
    ADD COLUMN team_winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    ADD COLUMN ul_tournament_id UUID REFERENCES ul_tournaments(id) ON DELETE SET NULL;
    ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    ADD CONSTRAINT check_winner_not_team 
    CHECK (team_winner_id <> player_team_id);


CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_matches_modtime 
BEFORE UPDATE ON matches 
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

COMMENT ON COLUMN matches.team_winner_id IS 'ID команды-победителя';
COMMENT ON COLUMN matches.ul_tournament_id IS 'ID турнира Upper League (опционально)';

-- 3. Модификация таблицы match_players
ALTER TABLE match_players 
    ADD COLUMN player_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE;

COMMENT ON COLUMN match_players.player_team_id IS 'ID команды игрока в этом матче';

-- 4. Создание связующей таблицы (если нужна связь many-to-many)
CREATE TABLE tournament_matches (
    tournament_id UUID NOT NULL REFERENCES ul_tournaments(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    PRIMARY KEY (tournament_id, match_id)
);

CREATE INDEX idx_matches_tournament ON matches(ul_tournament_id);
CREATE INDEX idx_matches_winner ON matches(team_winner_id);
CREATE INDEX idx_tournament_matches_match ON tournament_matches(match_id);