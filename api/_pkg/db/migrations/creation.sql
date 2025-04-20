-- Создание таблицы пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы постов
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы подписок
CREATE TABLE follows (
    following_user_id INTEGER NOT NULL REFERENCES users(id),
    followed_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (following_user_id, followed_user_id)
);

-- Создание таблицы игроков
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    fastcup_id VARCHAR(255) NOT NULL UNIQUE,
    UL_rating FLOAT DEFAULT 0.0,
    nickname VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для fastcup_id
CREATE INDEX idx_fastcup_id ON players(fastcup_id);

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
