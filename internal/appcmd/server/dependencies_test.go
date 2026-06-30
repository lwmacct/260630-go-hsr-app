package server

import (
	"context"
	"testing"

	"github.com/lwmacct/260630-go-hsr-app/internal/config"
)

func TestNewDependenciesWithoutTLSComposesAuthModule(t *testing.T) {
	cfg := config.DefaultConfig()
	cfg.Server.Database.SQLite = "file:final-compose-test?mode=memory&cache=shared"
	cfg.Server.HTTP.WebRoot = ""

	deps, err := newDependenciesWithoutTLS(context.Background(), &cfg)
	if err != nil {
		t.Fatal(err)
	}
	defer deps.Close()

	if deps.auth == nil {
		t.Fatal("auth module is nil")
	}
	if deps.oauth == nil {
		t.Fatal("oauth module is nil")
	}
	if deps.audit == nil {
		t.Fatal("audit module is nil")
	}
}

func TestNewHTTPAPIHandlerRegistersAllModules(t *testing.T) {
	cfg := config.DefaultConfig()
	cfg.Server.Database.SQLite = "file:final-api-registry-test?mode=memory&cache=shared"
	cfg.Server.HTTP.WebRoot = ""

	deps, err := newDependenciesWithoutTLS(context.Background(), &cfg)
	if err != nil {
		t.Fatal(err)
	}
	defer deps.Close()

	handler := newHTTPAPIHandler(&cfg, deps)
	if handler == nil {
		t.Fatal("api handler is nil")
	}
}
