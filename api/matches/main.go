package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	m "fastcup/_pkg"
	"fastcup/_pkg/db"
)

// GraphQLRequest структура для GraphQL-запроса
var port string

func GetMatches(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

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

	data := struct {
		Players []m.PlayerStats
	}{
		Players: processedPlayers,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Fatalf("Ошибка при преобразовании в JSON: %v", err)
	}
	w.Write([]byte(jsonData))
}

func main() {
	if os.Getenv("VERCEL") == "" {
		port = os.Getenv("PORT")
	}
	if port == "" {
		port = "3000"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", GetMatches) // Обрабатывает /api/matches

	log.Printf("Starting server on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
