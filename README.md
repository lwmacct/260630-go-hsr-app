# go-hsr-final

Final assembly project for HSR modules.

Current module set:

- `github.com/lwmacct/260630-go-hsr-auth/pkg/auth`

This project owns application wiring only: CLI, config, database opening, TLS, HTTP server, request context, and module composition. Feature modules should be consumed through public `pkg/...` APIs instead of importing their `internal/...` packages.

## Run

```bash
go run . server
```

## Verify

```bash
go test -count=1 ./...
go build .
```
