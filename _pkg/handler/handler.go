package handler

import (
	"context"
	"net/http"
	"strconv"

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
func GetPlayer(c *gin.Context) {
	if err := db.Init(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to connect to database",
		})
		return
	}
	defer db.Close()

	// Получаем ID игрока из параметров запроса
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Player ID is required",
		})
		return
	}

	// Конвертируем ID в число (если в БД используется int)
	playerID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid player ID format",
		})
		return
	}

	// Получаем последние 15 матчей игрока
	ctx := context.Background()
	matches, err := m.GetPlayerMatches(ctx, db.Pool, playerID, 15)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch player matches",
		})
		return
	}

	// Если нет матчей
	if len(matches) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message": "No matches found for this player",
			"data":    nil,
		})
		return
	}

	// Рассчитываем средние значения
	avgStats := m.CalculateAverageStats(matches)

	// Формируем ответ
	response := gin.H{
		"player_id":      playerID,
		"total_matches":  len(matches),
		"average_stats":  avgStats,
		"recent_matches": matches,
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   response,
	})

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

	if err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed to get players"})
	}
	c.JSON(http.StatusOK, data)
}
