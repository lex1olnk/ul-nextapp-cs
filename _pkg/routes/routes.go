package routes

import (
	"fastcup/_pkg/handler"

	"net/http"

	"github.com/gin-gonic/gin"
)

func Register(app *gin.Engine) {
	app.NoRoute(ErrRouter)

	route := app.Group("/api")
	{
		route.GET("/ping", handler.Ping)

		route.GET("/player/:id", handler.GetPlayer)

		route.GET("/players", handler.GetPlayers)

		route.GET("/matches", handler.GetMatches)

		route.POST("/matches", handler.PostMatches)

		route.POST("/ulrating", handler.UpdateUlRating)
	}
}

func ErrRouter(c *gin.Context) {
	c.JSON(http.StatusBadRequest, gin.H{
		"errors": "this page could not be found",
	})
}
