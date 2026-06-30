# go-hsr-final

Final assembly project for HSR modules.

Current module set:

- `github.com/lwmacct/260630-go-hsr-auth/pkg/auth`
- `github.com/lwmacct/260630-go-hsr-shared/pkg/...`

This project owns application wiring only: CLI, config, TLS, module composition, and the final HTTP route tree. Shared runtime utilities such as database opening, request context, and HTTP middleware come from `go-hsr-shared`. Feature modules should be consumed through public `pkg/...` APIs instead of importing their `internal/...` packages.

## Run

```bash
go run . server
```

## Verify

```bash
go test -count=1 ./...
go build .
```
