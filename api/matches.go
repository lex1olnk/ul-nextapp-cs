package api

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"net/http"
	"sort"

	m "fastcup/api/_pkg"
	"fastcup/api/_pkg/db"
)

// GraphQLRequest структура для GraphQL-запроса
//
//go:embed templates/top.html
var templateFS embed.FS

// MatchHandler обрабатывает запросы к маршруту /match/{id}
func GetMatches(w http.ResponseWriter, r *http.Request) {
	if err := db.Init(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Выполнение запроса
	rows, err := db.Pool.Query(context.Background(), `
		SELECT 
		p.player_id,
		p.nickname,
		p.UL_rating,
		COUNT(mp.match_id) AS matches,
		COALESCE(SUM(mp.kills), 0) AS kills,
		COALESCE(SUM(mp.deaths), 0) AS deaths,
		COALESCE(SUM(mp.assists), 0) AS assists,
		COALESCE(SUM(mp.headshots), 0) AS headshots,
		COALESCE(SUM(mp.kastscore), 0) AS kastscore,
		COALESCE(SUM(mp.damage), 0) AS damage,
		COALESCE(SUM(mp.exchanged), 0) AS exchanged,
		COALESCE(SUM(mp.firstdeaths), 0) AS firstdeaths,
		COALESCE(SUM(mp.firstkills), 0) AS firstkills,
		ARRAY[
		COALESCE(SUM(mp.multi_kills[1]), 0),
		COALESCE(SUM(mp.multi_kills[2]), 0),
		COALESCE(SUM(mp.multi_kills[3]), 0),
		COALESCE(SUM(mp.multi_kills[4]), 0),
		COALESCE(SUM(mp.multi_kills[5]), 0)
		] AS total_multi_kills,
		ARRAY[
		COALESCE(SUM(mp.clutches[1]), 0),
		COALESCE(SUM(mp.clutches[2]), 0),
		COALESCE(SUM(mp.clutches[3]), 0),
		COALESCE(SUM(mp.clutches[4]), 0),
		COALESCE(SUM(mp.clutches[5]), 0)
		] AS total_clutches,
		COALESCE(SUM(m.rounds), 0) AS total_rounds
		FROM players p
		LEFT JOIN match_players mp ON p.player_id = mp.player_id
		LEFT JOIN matches m ON mp.match_id = m.match_id
		GROUP BY p.player_id, p.nickname, p.UL_rating
		ORDER BY p.nickname`)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var stats []m.PlayerStats

	for rows.Next() {
		var s m.PlayerStats
		err := rows.Scan(
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
			&s.MultiKills,
			&s.Clutches,
			&s.Rounds,
		)

		if err != nil {
			http.Error(w, fmt.Sprintf("Data parsing error: %v", err), http.StatusInternalServerError)
			return
		}
		// Конвертация массивов

		stats = append(stats, s)
	}

	tmpl, err := template.ParseFS(templateFS, "templates/top.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	slice := make([]m.PlayerStats, 0, len(stats))

	for _, p := range stats {
		p.KPR = float64(p.Kills) / float64(p.Rounds)
		p.DPR = float64(p.Deaths) / float64(p.Rounds)
		p.KASTScore = p.KASTScore / float64(p.Rounds) * 100
		p.Impact = (1*float64(p.FirstKill) +
			.8*float64(p.MultiKills[1]) +
			1.08*float64(p.MultiKills[2]) +
			1.24*float64(p.MultiKills[3]) +
			1.4*float64(p.MultiKills[4]) +
			float64(p.Clutches[0]) +
			2*float64(p.Clutches[1]) +
			3*float64(p.Clutches[2]) +
			4*float64(p.Clutches[3]) +
			5*float64(p.Clutches[4])) / float64(p.Rounds)
		for _, i := range p.Clutches {
			p.ClutchScore += i
		}

		p.Headshots = 100 * p.Headshots / p.Rounds
		p.Damage /= p.Rounds

		p.Rating = 0.0073*p.KASTScore +
			0.359*p.KPR +
			-0.532*p.DPR +
			0.237*p.Impact +
			0.00327*float64(p.Damage) + 0.1587
		slice = append(slice, p)

	}

	data := struct {
		Players []m.PlayerStats
	}{
		Players: slice,
	}

	sort.Slice(data.Players, func(i, j int) bool {
		return data.Players[i].Rating > data.Players[j].Rating
	})

	err = tmpl.Execute(w, data)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	// Формируем GraphQL-запрос

	// Отправляем HTML-таблицу в ответе

	w.Header().Set("Content-Type", "text/html")
}
