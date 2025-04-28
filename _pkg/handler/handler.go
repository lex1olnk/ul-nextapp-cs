package handler

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"

	m "fastcup/_pkg"
	"fastcup/_pkg/db"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
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
	avgStats, err := m.GetAverageStats(ctx, db.Pool, playerID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch player avg stats",
		})
		return
	}
	avgMapsStats, err := m.GetAverageMapsStats(ctx, db.Pool, playerID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch player avg maps stats",
		})
		return
	}
	fmt.Println(avgStats, matches)
	// Формируем ответ
	response := gin.H{
		"total_matches":  len(matches),
		"player_stats":   avgStats,
		"maps_stats":     avgMapsStats,
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
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": err})
		return
	}

	data := struct {
		Players []gin.H
	}{
		Players: players,
	}

	c.JSON(http.StatusOK, data)
}

func PostMatches(c *gin.Context) {
	if err := db.Init(); err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed connect to db"})
		return
	}
	defer db.Close()

	googleCreds := fmt.Sprintf(`{
		"type": "service_account",
		"project_id": "%s",
		"private_key_id": "%s",
		"private_key": "%s",
		"client_email": "%s",
		"client_id": "%s",
		"project_id": "%s",		
		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
		"token_uri": "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_x509_cert_url": "%s",
		"universe_domain": "googleapis.com"
	}`,
		os.Getenv("GOOGLE_PROJECT_ID"),
		os.Getenv("GOOGLE_PRIVATE_KEY_ID"),
		os.Getenv("GOOGLE_PRIVATE_KEY"),
		os.Getenv("GOOGLE_CLIENT_EMAIL"),
		os.Getenv("GOOGLE_CLIENT_ID"),
		os.Getenv("GOOGLE_PROJECT_ID"),
		os.Getenv("GOOGLE_CLIENT_X509_CERT_URL"),
	)

	ctx := context.Background()
	// 3. Создаем сервис Sheets с учетными данными из файла
	srv, err := sheets.NewService(ctx, option.WithCredentialsJSON([]byte(googleCreds)))
	if err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed connect to google sheet"})
		return
	}

	// 4. ID документа (из URL Google Sheets)
	spreadsheetId := os.Getenv("GOOGLE_SHEET")

	// 5. Диапазон для чтения, например, "Sheet1!A1:C10"
	readRange := "src!A1:A100"

	// 6. Получаем значения указываем диапазон
	resp, err := srv.Spreadsheets.Values.Get(spreadsheetId, readRange).Do()
	if err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed fetch data"})
	}

	re := regexp.MustCompile(`matches/(\d+)`)
	// 7. Проверяем и выводим данные
	if len(resp.Values) == 0 {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed fetch excel data"})
	}

	fmt.Println("Полученные данные:")
	fmt.Println(spreadsheetId)
	for _, row := range resp.Values {
		url := re.FindStringSubmatch(row[0].(string))
		matchID, err := strconv.Atoi(url[1])
		fmt.Println(matchID)
		if err != nil {
			// ... handle error
			c.JSON(http.StatusExpectationFailed, gin.H{"Message": "matchIdincorrect"})
			panic(err)
		}

		err = m.CreateMatch(db.Pool, matchID)
		if err != nil {
			c.JSON(http.StatusExpectationFailed, gin.H{"Message": err})
			panic(err)
		}

	}

	// Формируем GraphQL-запрос

	// Отправляем HTML-таблицу в ответе

	c.JSON(http.StatusOK, "OK")
}

type Player struct {
	ID       int    `json:"id"`
	Nickname string `json:"nickname"`
}

func GetPlayers(c *gin.Context) {
	if err := db.Init(); err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed connect to db"})
		return
	}
	defer db.Close()
	ctx := context.Background()
	query := `SELECT id, nickname
	FROM players`

	rows, err := db.Pool.Query(ctx, query)

	if err != nil {
		return
	}
	defer rows.Close()

	var players []Player
	for rows.Next() {
		var p Player
		if err := rows.Scan(
			&p.ID,
			&p.Nickname,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status": "error",
			})
		}
		players = append(players, p)
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"players": players,
		},
	})
}

func UpdateUlRating(c *gin.Context) {
	if err := db.Init(); err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed connect to db"})
		return
	}
	defer db.Close()

	googleCreds := fmt.Sprintf(`{
		"type": "service_account",
		"project_id": "%s",
		"private_key_id": "%s",
		"private_key": "%s",
		"client_email": "%s",
		"client_id": "%s",
		"project_id": "%s",		
		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
		"token_uri": "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_x509_cert_url": "%s",
		"universe_domain": "googleapis.com"
	}`,
		os.Getenv("GOOGLE_PROJECT_ID"),
		os.Getenv("GOOGLE_PRIVATE_KEY_ID"),
		os.Getenv("GOOGLE_PRIVATE_KEY"),
		os.Getenv("GOOGLE_CLIENT_EMAIL"),
		os.Getenv("GOOGLE_CLIENT_ID"),
		os.Getenv("GOOGLE_PROJECT_ID"),
		os.Getenv("GOOGLE_CLIENT_X509_CERT_URL"),
	)

	ctx := context.Background()
	// 3. Создаем сервис Sheets с учетными данными из файла
	srv, err := sheets.NewService(ctx, option.WithCredentialsJSON([]byte(googleCreds)))
	if err != nil {
		c.JSON(http.StatusExpectationFailed, gin.H{"Message": "failed connect to google sheet"})
		return
	}

	// 4. ID документа (из URL Google Sheets)
	spreadsheetId := "17tVAH5v339qDdcUG0LHuYKUett1CbZ3UMGxZAPyBleg"

	// 5. Диапазон для чтения, например, "Sheet1!A1:C10"
	playersRange := "FACEIT!A2:D300"
	playersResp, err := srv.Spreadsheets.Values.Get(spreadsheetId, playersRange).Do()

	if err != nil || len(playersResp.Values) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get players data", "msg": playersResp})
		return
	}

	// Создаем мапы для связи данных
	type PlayerData struct {
		ID       int
		UlRating float64
		Faceit   string
	}
	players := make(map[string]PlayerData)
	for _, row := range playersResp.Values {
		if len(row) < 3 {
			continue
		}

		nickname := strings.TrimSpace(row[0].(string))
		faceit := strings.TrimSpace(row[1].(string))
		id, _ := strconv.Atoi(strings.TrimSpace(row[3].(string)))

		players[nickname] = PlayerData{
			ID:       id,
			UlRating: 0,
			Faceit:   faceit,
		}
	}

	// 2. Получаем рейтинги из листа с UL рейтингами
	ratingsRange := "УЛЬ Rating 4.0!B1:FF" // A: ник, B: UL рейтинг
	ratingsResp, err := srv.Spreadsheets.Values.Get(spreadsheetId, ratingsRange).Do()
	if err != nil || len(ratingsResp.Values) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get ratings data"})
		return
	}

	for i := range ratingsResp.Values[0] {
		nickname := strings.TrimSpace(ratingsResp.Values[0][i].(string))
		ulratingstr := strings.Replace(strings.TrimSpace(ratingsResp.Values[1][i].(string)), ",", ".", 1)
		ulrating, _ := strconv.ParseFloat(ulratingstr, 64)

		// If the key exists
		if p, ok := players[nickname]; ok {
			p.UlRating = ulrating
			players[nickname] = p
		}
	}

	queryUpdate := `
		UPDATE players 
		SET 
				ul_rating = $1,
				faceit = CASE 
						WHEN faceit IS NULL OR faceit = '' THEN $2 
						ELSE faceit 
				END
		WHERE id = $3
	`

	for _, player := range players {
		var exists bool
		err = db.Pool.QueryRow(ctx,
			"SELECT EXISTS(SELECT 1 FROM players WHERE id = $1)",
			player.ID).Scan(&exists)

		if err != nil {
			c.JSON(http.StatusOK, gin.H{"error": err})
			return
		}

		if exists {
			_, err := db.Pool.Exec(ctx, queryUpdate, player.UlRating, player.Faceit, player.ID)
			if err != nil {
				c.JSON(http.StatusOK, gin.H{"error": err})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": players})
}
