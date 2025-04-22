package main

import (
	"flag"
	"log"
	"net/http"
)

var port string

func init() {
	flag.StringVar(&port, "port", "Port", "The port man...")
	flag.Parse()
}

func main() {
	// New mux
	mux := http.NewServeMux()

	log.Println("Listening...")
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
