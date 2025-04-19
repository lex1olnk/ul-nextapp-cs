package api

import (
	"context"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strconv"

	m "template-go-vercel/api/_pkg"

	"github.com/joho/godotenv"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

// GraphQLRequest структура для GraphQL-запроса

// MatchHandler обрабатывает запросы к маршруту /match/{id}
func Matches(w http.ResponseWriter, r *http.Request) {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}
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
		http.Error(w, "Не удалось создать клиента Sheets: %v", http.StatusBadRequest)
		return
	}

	// 4. ID документа (из URL Google Sheets)
	spreadsheetId := "1YbgNUsnq40fqx1V5BetVy131mIgzB0azDLE07YWxGso"

	// 5. Диапазон для чтения, например, "Sheet1!A1:C10"
	readRange := "src!A1:A10"

	// 6. Получаем значения указываем диапазон
	resp, err := srv.Spreadsheets.Values.Get(spreadsheetId, readRange).Do()
	if err != nil {
		http.Error(w, "Не удалось получить данные из таблицы: %v", http.StatusBadRequest)
	}
	stats := m.NewStats()

	re := regexp.MustCompile(`matches/(\d+)`)
	// 7. Проверяем и выводим данные
	if len(resp.Values) == 0 {
		fmt.Println("Данные не найдены.")
	} else {
		fmt.Println("Полученные данные:")

		for _, row := range resp.Values {
			url := re.FindStringSubmatch(row[0].(string))
			matchID, err := strconv.Atoi(url[1])
			if err != nil {
				// ... handle error
				panic(err)
			}
			currentPlayers := m.GetMatchMembers(w, matchID, stats)

			if !m.GetMatchKills(w, matchID, stats, currentPlayers) {
				http.Error(w, "kills error", http.StatusBadRequest)
				return
			}

			if !m.GetMatchDamages(w, matchID, stats) {
				http.Error(w, "damages error", http.StatusBadRequest)
				return
			}
		}
	}

	tmpl, err := template.ParseFiles("templates/top.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	slice := make([]m.PlayerStats, 0, len(stats.Players))
	for _, p := range stats.Players {
		p.KPR = float64(p.Kills) / float64(p.Rounds)
		p.DPR = float64(p.Deaths) / float64(p.Rounds)
		p.KASTScore = p.KASTScore / float64(p.Rounds) * 100
		p.Impact = (0.7*float64(p.FirstKill) +
			0.8*float64(p.MultiKills[0]) +
			1.08*float64(p.MultiKills[1]) +
			1.24*float64(p.MultiKills[2]) +
			1.4*float64(p.MultiKills[3]) +
			1.6*float64(p.MultiKills[4])) / float64(p.Rounds)
		p.Headshots = 100 * p.Headshots / p.Rounds
		p.AverageDamage /= float64(p.Rounds)

		p.Rating = 0.00134*p.KASTScore/.73 +
			0.514*p.KPR/.7 +
			-0.359*p.DPR/0.62 +
			0.327*p.Impact/0.3 +
			0.00194*p.AverageDamage/0.80
		slice = append(slice, *p)

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
