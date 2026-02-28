# Build stage
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o med_monitor_backend .

# Run stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/med_monitor_backend .
COPY --from=builder /app/casbin ./casbin
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/.env ./.env

EXPOSE 8080
CMD ["./med_monitor_backend"]
