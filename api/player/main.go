package main

import (
	"net/http"

	"fastcup/_pkg/db"
)

// GraphQLRequest структура для GraphQL-запроса
//

// MatchHandler обрабатывает запросы к маршруту /match/{id}
func GetPlayer(w http.ResponseWriter, r *http.Request) {
	if err := db.Init(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	w.Header().Set("Content-Type", "text/html")
}
