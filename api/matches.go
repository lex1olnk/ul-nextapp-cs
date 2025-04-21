package api

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"net/http"

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
	ctx := context.Background()
	players, err := m.GetAggregatedPlayerStats(ctx, db.Pool)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get players: %v", err), http.StatusInternalServerError)
		return
	}
	processedPlayers := m.ProcessPlayerStats(players)

	tmpl, err := template.ParseFS(templateFS, "templates/top.html")
	if err != nil {
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
		return
	}

	data := struct {
		Players []m.PlayerStats
	}{
		Players: processedPlayers,
	}

	w.Header().Set("Content-Type", "text/html")
	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, fmt.Sprintf("Template execution error: %v", err), http.StatusInternalServerError)
	}
}
