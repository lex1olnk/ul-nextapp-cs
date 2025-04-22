package handler

import (
	api "fastcup/api"
	"flag"
	"log"
	"net/http"
)

var port string

func init() {
	flag.StringVar(&port, "port", "Port", "The port man...")
	flag.Parse()
}

func Handler(w http.ResponseWriter, r *http.Request) {
	// New mux
	mux := http.NewServeMux()
	// Route
	mux.Handle("/hello", http.HandlerFunc(api.Hello))

	mux.Handle("/matches", http.HandlerFunc(api.GetMatches))

	mux.Handle("/post_matches", http.HandlerFunc(api.PostMatches))

	log.Println("Listening...")
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
