package main

import (
	"fastcup/_pkg/handler"

	"net/http"

	"github.com/gin-gonic/gin"
)

func HomepageHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Welcome to the Tech Company listing API with Golang"})
}

func main() {
	router := gin.Default()

	router.GET("/ping", handler.Ping)

	router.GET("/player/:id", handler.GetPlayer)

	router.GET("/players", handler.GetPlayers)

	router.GET("/matches", handler.GetMatches)

	router.POST("/matches", handler.PostMatches)

	router.POST("/ulrating", handler.UpdateUlRating)

	router.Run()
}

func ErrRouter(c *gin.Context) {
	c.JSON(http.StatusBadRequest, gin.H{
		"errors": "this page could not be found",
	})
}
