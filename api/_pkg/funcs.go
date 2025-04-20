package pkg

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func SendGraphQLRequest(w http.ResponseWriter, query string, variables map[string]int, responseBody interface{}) bool {
	requestBody := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	// Кодируем тело запроса в JSON
	requestBodyJSON, err := json.Marshal(requestBody)
	if err != nil {
		http.Error(w, "Error encoding request body", http.StatusInternalServerError)
		return false
	}

	resp, err := http.Post("https://hasura.fastcup.net/v1/graphql", "application/json", bytes.NewBuffer(requestBodyJSON))
	if err != nil {
		http.Error(w, "Error fetching match data", http.StatusInternalServerError)
		return false
	}
	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&responseBody); err != nil {
		http.Error(w, "Error decoding response body", http.StatusInternalServerError)
		return false
	}

	return true
}

func GetMatchMembers(w http.ResponseWriter, matchID int, stats *Stats) []int {
	query := fullMatchQuery

	variables := map[string]int{
		"matchId": matchID,
		"gameId":  3,
	}
	var responseBody GetMatchStatsResponse
	if !SendGraphQLRequest(w, query, variables, &responseBody) {
		return nil
	}

	return stats.GetMatchData(responseBody.Data.Match)
}

func GetMatchClutches(w http.ResponseWriter, matchID int, stats *Stats) bool {
	query := matchCluchesQuery

	variables := map[string]int{
		"matchId": matchID,
	}
	var responseBody GraphQLClutchResponse
	if !SendGraphQLRequest(w, query, variables, &responseBody) {
		return false
	}
	stats.GetMatchClutches(responseBody.Data.Clutches)
	return true
}

func GetMatchKills(w http.ResponseWriter, matchID int, stats *Stats, currentPlayers []int) bool {
	query := matchKillsQuery

	variables := map[string]int{
		"matchId": matchID,
		//"userId":  0, // Замените на нужный userId, если требуется
	}

	var responseBody GraphQLKillsResponse
	if !SendGraphQLRequest(w, query, variables, &responseBody) {
		return false
	}

	stats.ProcessKills(responseBody.Data.Kills, currentPlayers)
	return true
}

func GetMatchDamages(w http.ResponseWriter, matchID int, stats *Stats) bool {
	query := matchDamageQuery

	variables := map[string]int{
		"matchId": matchID,
		//"userId":  0, // Замените на нужный userId, если требуется
	}

	// Декодируем JSON-ответ
	var responseBody GraphQLDamagesResponse
	if !SendGraphQLRequest(w, query, variables, &responseBody) {
		return false
	}

	stats.ProcessDamage(responseBody.Data.Damages)
	return true
}

func (stats *Stats) GetMatchData(match Match) []int {
	var currentPlayers []int
	for _, player := range match.Members {
		user := player.Private.User
		if _, ok := stats.Players[user.ID]; !ok {
			stats.Players[user.ID] = &PlayerStats{}
			stats.Players[user.ID].ID = user.ID
			stats.Players[user.ID].Nickname = user.NickName
		}
		currentPlayers = append(currentPlayers, user.ID)
		stats.Players[user.ID].Rounds += len(match.Rounds)
	}
	return currentPlayers
}

func (stats *Stats) GetMatchClutches(clutches []Clutch) {
	for _, clutch := range clutches {
		if clutch.Success {
			stats.Players[clutch.UserId].Clutches[clutch.Amount-1]++
			stats.Players[clutch.UserId].ClutchScore += clutch.Amount
		}
	}
}

func CalculateTrade(index int, killer Kill, kills []Kill, stats *Stats) int {
	for i := index - 1; i > -1; i-- {
		difference := killer.CreatedAt.Sub(kills[i].CreatedAt)
		if difference.Seconds() > 5 {
			return 0
		}
		if killer.VictimId == kills[i].KillerId {
			stats.Players[killer.KillerId].Traded++
			stats.Players[kills[i].VictimId].Exchanged++
			return kills[i].VictimId
		}
	}
	return 0
	//difference := trader.CreatedAt.Second() - killer.CreatedAt.Second()
	//fmt.Println(difference)
	// Время убийства

}

import (
	"context"
	"encoding/json"
	"net/http"
	
	"your-project/db"
)

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
}

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
		stats.Players[damage.InflictorId].AverageDamage += float64(damage.DamageNormalized)
	}
}
