package pkg

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SendGraphQLRequest(query string, variables map[string]int, responseBody interface{}) bool {
	requestBody := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	// Кодируем тело запроса в JSON
	requestBodyJSON, err := json.Marshal(requestBody)
	if err != nil {
		return false
	}

	resp, err := http.Post("https://hasura.fastcup.net/v1/graphql", "application/json", bytes.NewBuffer(requestBodyJSON))
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&responseBody); err != nil {
		return false
	}

	return true
}

func GetMatchMembers(matchID int, stats *Stats) Match {
	query := fullMatchQuery

	variables := map[string]int{
		"matchId": matchID,
		"gameId":  3,
	}
	var responseBody GetMatchStatsResponse
	if !SendGraphQLRequest(query, variables, &responseBody) {
		return Match{}
	}
	stats.AddMatchData(responseBody.Data.Match)
	return responseBody.Data.Match
}

func GetMatchClutches(matchID int, stats *Stats) bool {
	query := matchCluchesQuery

	variables := map[string]int{
		"matchId": matchID,
	}
	var responseBody GraphQLClutchResponse
	if !SendGraphQLRequest(query, variables, &responseBody) {
		return false
	}
	stats.AddMatchClutches(responseBody.Data.Clutches)
	return true
}

func GetMatchKills(matchID int, stats *Stats, currentPlayers []int) bool {
	query := matchKillsQuery

	variables := map[string]int{
		"matchId": matchID,
		//"userId":  0, // Замените на нужный userId, если требуется
	}

	var responseBody GraphQLKillsResponse
	if !SendGraphQLRequest(query, variables, &responseBody) {
		return false
	}
	fmt.Println("1")
	stats.ProcessKills(responseBody.Data.Kills, currentPlayers)
	fmt.Println("2")
	return true
}

func GetMatchDamages(matchID int, stats *Stats) bool {
	query := matchDamageQuery

	variables := map[string]int{
		"matchId": matchID,
		//"userId":  0, // Замените на нужный userId, если требуется
	}

	// Декодируем JSON-ответ
	var responseBody GraphQLDamagesResponse
	if !SendGraphQLRequest(query, variables, &responseBody) {
		return false
	}

	stats.ProcessDamage(responseBody.Data.Damages)
	return true
}

func (stats *Stats) AddMatchData(match Match) {
	for _, player := range match.Members {
		user := player.Private.User
		if _, ok := stats.Players[user.ID]; !ok {
			stats.Players[user.ID] = &PlayerStats{}
			stats.Players[user.ID].ID = user.ID
			stats.Players[user.ID].Nickname = user.NickName
			stats.Players[user.ID].TeamID = player.MatchTeamID
		}
		stats.Players[user.ID].Rounds += len(match.Rounds)
	}
}

func (stats *Stats) AddMatchClutches(clutches []Clutch) {
	for _, clutch := range clutches {
		if clutch.Success {
			stats.Players[clutch.UserId].Clutches[clutch.Amount-1]++
			stats.Players[clutch.UserId].ClutchScore += clutch.Amount
		}
	}
}

func CreateMatch(pool *pgxpool.Pool, matchID int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	tx, err := pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback(ctx)
		}
	}()

	fmt.Println("STEP 1", matchID)
	// Проверка существования матча
	var exists bool
	err = tx.QueryRow(ctx,
		"SELECT EXISTS(SELECT 1 FROM matches WHERE id = $1)",
		matchID).Scan(&exists)

	if err != nil {
		return fmt.Errorf("match check failed: %w", err)
	}
	if exists {
		return fmt.Errorf("match not found: %w", err)
	}
	fmt.Println("STEP 2")
	// Получение данных матча
	stats := NewStats()
	match := GetMatchMembers(matchID, stats)
	if err != nil {
		return fmt.Errorf("failed to get match members: %w", err)
	}
	fmt.Println("step2.2")
	// Добавление команды
	for _, team := range match.Teams {
		//fmt.Println("team"+strconv.Itoa(team.ID), team.ID)
		_, err := tx.Exec(ctx,
			`INSERT INTO teams (team_id, team_name)
			VALUES ($1, $2)`,
			team.ID,
			"team"+strconv.Itoa(team.ID),
		)

		if err != nil {
			fmt.Println("failed to insert team", err)
			return fmt.Errorf("player check failed: %w", err)
		}
	}

	fmt.Println("STEP 3")
	// Обработка игроков
	var playerIDs []int
	for userID, player := range stats.Players {
		var exist bool

		err = tx.QueryRow(ctx,
			"SELECT EXISTS(SELECT 1 FROM players WHERE id = $1)",
			userID).Scan(&exist)

		if err != nil {
			return fmt.Errorf("player check failed: %w", err)
		}
		playerIDs = append(playerIDs, userID)
		if exist {
			continue
		}
		_, err := tx.Exec(ctx,
			`INSERT INTO players (id, ul_rating, nickname)
			VALUES ($1, $2, $3)`,
			userID,
			0.0,
			player.Nickname,
		)
		if err != nil {
			return fmt.Errorf("failed to upsert player: %w", err)
		}

	}
	winnerID := match.Teams[0].ID
	if match.Teams[1].IsWinner {
		winnerID = match.Teams[1].ID
	}

	fmt.Println("STEP 4")
	// Вставка данных матча
	_, err = tx.Exec(ctx,
		`INSERT INTO matches 
		(id, rounds, started_at, finished_at, team_winner_id, map)
		VALUES ($1, $2, $3, $4, $5, $6)`,
		matchID,
		len(match.Rounds),
		match.StartedAt,
		match.FinishedAt,
		winnerID,
		match.Maps[0].Map.Name,
	)
	if err != nil {
		return fmt.Errorf("failed to insert match: %w", err)
	}
	fmt.Println("STEP 4 1")
	if !GetMatchKills(matchID, stats, playerIDs) {
		return errors.New("failed to take kills")
	}
	fmt.Println("STEP 4 2")
	if !GetMatchDamages(matchID, stats) {
		return errors.New("failed to take damages")
	}
	fmt.Println("STEP 4")
	if !GetMatchClutches(matchID, stats) {
		return errors.New("failed to take clutches")
	}

	fmt.Println("inserting")

	// Вставка статистики игроков
	for userID, player := range stats.Players {
		player.CalculateDerivedStats()
		_, err = tx.Exec(ctx,
			`INSERT INTO match_players 
			(match_id, player_id, player_team_id, kills, deaths, assists, headshots, exchanged, 
			kastscore, firstdeaths, firstkills, damage, impact, rating, multi_kills, clutches)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
			matchID,
			userID,
			player.TeamID,
			player.Kills,
			player.Deaths,
			player.Assists,
			player.Headshots,
			player.Exchanged,
			player.KASTScore,
			player.FirstDeath,
			player.FirstKill,
			player.Damage,
			player.Impact,
			player.Rating,
			pgtype.FlatArray[int](player.MultiKills[:]),
			pgtype.FlatArray[int](player.Clutches[:]),
		)
		if err != nil {
			return fmt.Errorf("failed to insert player stats: %w", err)
		}
	}

	// Фиксируем транзакцию
	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("transaction commit failed: %w", err)
	}
	return nil
}

func CalculateTrade(index int, killer Kill, kills []Kill, stats *Stats) int {
	for i := index - 1; i > -1; i-- {
		difference := killer.CreatedAt.Sub(kills[i].CreatedAt)
		if difference.Seconds() > 5 {
			return 0
		}
		if killer.VictimId == kills[i].KillerId {
			stats.Players[kills[i].VictimId].Exchanged++
			return kills[i].VictimId
		}
	}
	return 0
	//difference := trader.CreatedAt.Second() - killer.CreatedAt.Second()
	//fmt.Println(difference)
	// Время убийства

}

func GetAggregatedPlayerStats(ctx context.Context, pool *pgxpool.Pool) ([]PlayerStats, error) {
	query := GetPlayerStats

	rows, err := pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("database query error: %w", err)
	}
	defer rows.Close()

	var stats []PlayerStats
	for rows.Next() {
		var s PlayerStats
		if err := rows.Scan(
			&s.ID,
			&s.Nickname,
			&s.ULRating,
			&s.Matches,
			&s.Kills,
			&s.Deaths,
			&s.Assists,
			&s.Headshots,
			&s.KASTScore,
			&s.Damage,
			&s.Exchanged,
			&s.FirstDeath,
			&s.FirstKill,
			&s.Rating,
			&s.MultiKills,
			&s.Clutches,
			&s.Rounds,
		); err != nil {
			return nil, fmt.Errorf("data scanning error: %w", err)
		}
		stats = append(stats, s)
	}

	return stats, nil
}

func ProcessPlayerStats(players []PlayerStats) []PlayerStats {
	var processed []PlayerStats

	for _, p := range players {
		p.CalculateDerivedStats()
		processed = append(processed, p)
	}

	sort.Slice(processed, func(i, j int) bool {
		return processed[i].Rating > processed[j].Rating
	})

	return processed
}

/*
func GetMixes(w http.ResponseWriter, r *http.Request) {
	conn, err := db.Pool.Acquire(context.Background())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Release()

	rows, err := conn.Query(context.Background(), "SELECT * FROM mixes")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var mixes []Mix
	for rows.Next() {
		var m Mix
		err := rows.Scan(&m.ID, &m.Title, &m.Author, &m.Rating)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		mixes = append(mixes, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mixes)
}*/

type Mix struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Author string `json:"author"`
	Rating int    `json:"rating"`
}

type roundType struct {
	kills     int
	isDead    bool
	hasKill   bool
	hasTrade  bool
	hasAssist bool
}

func (stats *Stats) ProcessKills(kills []Kill, currentPlayers []int) {
	roundKAST := make(map[int]*roundType)
	for i := range currentPlayers {
		if _, ok := roundKAST[currentPlayers[i]]; !ok {
			roundKAST[currentPlayers[i]] = &roundType{}
			roundKAST[currentPlayers[i]].isDead = true
		}
	}
	roundId := 0
	for i, kill := range kills {
		if roundId != kill.RoundId {
			for a := range roundKAST {
				if !roundKAST[a].isDead || roundKAST[a].hasKill || roundKAST[a].hasAssist || roundKAST[a].hasTrade {
					stats.Players[a].KASTScore++
				}
				if roundKAST[a].kills > 0 {
					stats.Players[a].MultiKills[roundKAST[a].kills-1]++
					roundKAST[a].kills = 0
				}
				roundKAST[a].isDead = false
				roundKAST[a].hasKill = false
				roundKAST[a].hasAssist = false
				roundKAST[a].hasTrade = false
			}
		}
		stats.Players[kill.VictimId].Deaths++
		roundKAST[kill.VictimId].isDead = true

		stats.Players[kill.KillerId].Kills++
		roundKAST[kill.KillerId].kills++
		if kill.IsHeadshot {
			stats.Players[kill.KillerId].Headshots++
		}
		roundKAST[kill.KillerId].hasKill = true

		if kill.AssistantId != nil {
			stats.Players[*kill.AssistantId].Assists++
			roundKAST[*kill.AssistantId].hasAssist = true
		}

		idExchanged := CalculateTrade(i, kill, kills, stats)
		if idExchanged != 0 {
			roundKAST[idExchanged].hasTrade = true
		}

		// Расчет первого убийства и смерти
		if roundId != kill.RoundId {
			stats.Players[kill.KillerId].FirstKill++
			stats.Players[kill.VictimId].FirstDeath++

			roundId = kill.RoundId
		}

	}
	for a := range roundKAST {
		if !roundKAST[a].isDead || roundKAST[a].hasKill || roundKAST[a].hasAssist || roundKAST[a].hasTrade {
			stats.Players[a].KASTScore++
		}
		if roundKAST[a].kills > 0 {
			stats.Players[a].MultiKills[roundKAST[a].kills-1]++
		}
		roundKAST[a].isDead = false
		roundKAST[a].hasKill = false
		roundKAST[a].hasAssist = false
		roundKAST[a].hasTrade = false
	}
}

func (stats *Stats) ProcessDamage(Damages []Damage) {
	for _, damage := range Damages {
		if _, ok := stats.Players[damage.InflictorId]; !ok {
			stats.Players[damage.InflictorId] = &PlayerStats{}
		}
		stats.Players[damage.InflictorId].Damage += float64(damage.DamageNormalized)
	}
}

func GetPlayerMatches(ctx context.Context, pool *pgxpool.Pool, playerID int, limit int) ([]PlayerStats, error) {
	query := `
		SELECT 
			mp.match_id,
			m.map,
			mp.kills,
			mp.deaths,
			mp.assists,
			mp.headshots,
			mp.exchanged,
			mp.firstdeaths,
			mp.firstkills,
			mp.damage,
			mp.kastscore,
			mp.multi_kills,
			mp.clutches,
			m.rounds
		FROM 
			match_players AS mp
		JOIN 
			matches AS m ON mp.match_id = m.id
		WHERE 
			mp.player_id = $1
		ORDER BY 
			mp.created_at DESC
		LIMIT $2;
    `

	rows, err := pool.Query(ctx, query, playerID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []PlayerStats
	for rows.Next() {
		var stats PlayerStats

		err := rows.Scan(
			&stats.MatchID,
			&stats.Map,
			&stats.Kills,
			&stats.Deaths,
			&stats.Assists,
			&stats.Headshots,
			&stats.Exchanged,
			&stats.FirstDeath,
			&stats.FirstKill,
			&stats.Damage,
			&stats.KASTScore,
			&stats.MultiKills,
			&stats.Clutches,
			&stats.Rounds,
		)
		stats.CalculateDerivedStats()
		if err != nil {
			return nil, err
		}
		matches = append(matches, stats)
	}

	return matches, nil
}

func GetAverageStats(ctx context.Context, pool *pgxpool.Pool, playerID int) gin.H {
	query := GetAverageStatsQuery

	var result PlayerComparison
	err := pool.QueryRow(ctx, query, playerID).Scan(
		&result.PlayerID,
		&result.Nickname,
		&result.ULRating,
		&result.Kills,
		&result.Deaths,
		&result.Assists,
		&result.FirstKills,
		&result.FirstDeaths,
		&result.KAST,
		&result.WinratePercentile,
		&result.KDPercentile,
		&result.HSPercentile,
		&result.AvgPercentile,
		&result.TargetWinrate,
		&result.TargetKD,
		&result.TargetHSRatio,
		&result.TargetAvg,
	)

	if err != nil {
		return gin.H{"error": err}
	}

	return gin.H{
		"playerID":      result.PlayerID,
		"nickname":      result.Nickname,
		"uLRating":      result.ULRating,
		"kills":         result.Kills,
		"deaths":        result.Deaths,
		"assists":       result.Assists,
		"firstKills":    result.FirstKills,
		"firstDeaths":   result.FirstDeaths,
		"kast":          result.KAST,
		"winrateAdv":    result.WinratePercentile,
		"kdAdv":         result.KDPercentile,
		"hsAdv":         result.HSPercentile,
		"avgAdv":        result.AvgPercentile,
		"TargetWinrate": result.TargetWinrate,
		"TargetKD":      result.TargetKD,
		"TargetHSRatio": result.TargetHSRatio,
		"TargetAvg":     result.TargetAvg,
	}
}
