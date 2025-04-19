package api

import (
	"net/http"

	m "fastcup/api/_pkg"
)

func Hello(w http.ResponseWriter, req *http.Request) {
	w.WriteHeader(http.StatusOK)

	model := *m.NewModel()

	resp := "Hello " + model.Name
	w.Write([]byte(resp))
}
