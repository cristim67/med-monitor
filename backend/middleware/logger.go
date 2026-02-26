package middleware

import (
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func LoggerMiddleware() gin.HandlerFunc {
	// Configure zerolog to be pretty and colorful
	output := zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339}
	log.Logger = log.Output(output).With().Timestamp().Logger()

	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Log details after request
		end := time.Now()
		latency := end.Sub(start)
		method := c.Request.Method
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()

		if raw != "" {
			path = path + "?" + raw
		}

		logger := log.Info()
		if statusCode >= 400 && statusCode < 500 {
			logger = log.Warn()
		} else if statusCode >= 500 {
			logger = log.Error()
		}

		logger.
			Int("status", statusCode).
			Str("method", method).
			Str("path", path).
			Str("ip", clientIP).
			Dur("latency", latency).
			Msg("HTTP Request")
	}
}
