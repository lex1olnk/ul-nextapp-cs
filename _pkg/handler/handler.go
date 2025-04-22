package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	m "fastcup/_pkg"
	"fastcup/_pkg/db"

	"github.com/gin-gonic/gin"
)

func Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ping": "pong"})
}

// @Tags        Welcome
// @Summary     Hello User
// @Description Endpoint to Welcome user and say Hello "Name"
// @Param       name query string true "Name in the URL param"
// @Accept      json
// @Produce     json
// @Success     200 {object} object "success"
// @Failure     400 {object} object "Request Error or parameter missing"
// @Failure     404 {object} object "When user not found"
// @Failure     500 {object} object "Server Error"
// @Router      /hello/:name [GET]

// GraphQLRequest структура для GraphQL-запроса
//

// MatchHandler обрабатывает запросы к маршруту /match/{id}
func Player(c *gin.Context) {
	if err := db.Init(); err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed to take players"})
	}
	defer db.Close()
}

func GetMatches(c *gin.Context) {

	if err := db.Init(); err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed connect to db"})
		return
	}
	defer db.Close()
	ctx := context.Background()
	players, err := m.GetAggregatedPlayerStats(ctx, db.Pool)

	if err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed to get players"})
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
	c.JSON(http.StatusOK, []byte(jsonData))
}
