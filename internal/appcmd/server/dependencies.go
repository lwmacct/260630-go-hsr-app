package server

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/lwmacct/260614-go-pkg-tlsreload/pkg/adapters/op"
	"github.com/lwmacct/260614-go-pkg-tlsreload/pkg/tlsreload"
	"github.com/lwmacct/260630-go-hsr-shared/pkg/appmodule"
	"github.com/lwmacct/260630-go-hsr-shared/pkg/database"
	"github.com/lwmacct/260630-go-hsr-shared/pkg/requestctx"
	"github.com/uptrace/bun"

	"github.com/lwmacct/260630-go-hsr-app/internal/config"
)

type dependencies struct {
	db       *bun.DB
	modules  *appmodule.Runtime
	auth     *AuthModule
	oauth    *OauthModule
	audit    *AuditModule
	requests requestctx.Middleware
	tls      *tlsreload.Manager
}

func newDependencies(ctx context.Context, cfg *config.Config) (*dependencies, error) {
	deps, err := newDependenciesWithoutTLS(ctx, cfg)
	if err != nil {
		return nil, err
	}

	tlsManager, err := tlsreload.New(ctx, cfg.Server.HTTP.TLS, tlsreload.Options{
		Logger: slog.Default(),
		Adapters: []tlsreload.Adapter{
			op.New(op.Options{}),
		},
	})
	if err != nil {
		deps.Close()
		return nil, fmt.Errorf("configure tls: %w", err)
	}
	deps.tls = tlsManager
	return deps, nil
}

func newDependenciesWithoutTLS(ctx context.Context, cfg *config.Config) (*dependencies, error) {
	db, err := database.Open(ctx, databaseConfig(cfg.Server.Database))
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	modules, err := appmodule.Build(ctx, db,
		NewAuthSpec(cfg),
		NewOauthSpec(cfg),
		NewAuditSpec(),
	)
	if err != nil {
		_ = db.Close()
		return nil, err
	}
	authModule := appmodule.MustGet[*AuthModule](modules, "auth")
	oauthModule := appmodule.MustGet[*OauthModule](modules, "oauth")
	auditModule := appmodule.MustGet[*AuditModule](modules, "audit")
	return &dependencies{
		db:       db,
		modules:  modules,
		auth:     authModule,
		oauth:    oauthModule,
		audit:    auditModule,
		requests: requestctx.NewMiddleware(cfg.Server.HTTP.TrustedProxies),
	}, nil
}

func (d *dependencies) Close() {
	if d == nil {
		return
	}
	if d.tls != nil {
		d.tls.Close()
		d.tls = nil
	}
	if d.modules != nil {
		_ = d.modules.Close()
		d.modules = nil
	}
	if d.db != nil {
		_ = d.db.Close()
		d.db = nil
	}
	d.auth = nil
	d.oauth = nil
	d.audit = nil
}

func databaseConfig(cfg config.ServerDatabase) database.Config {
	return database.Config{
		Type:   cfg.Type,
		SQLite: cfg.SQLite,
		PGSQL: database.PGSQLConfig{
			Host:     cfg.PGSQL.Host,
			Port:     cfg.PGSQL.Port,
			User:     cfg.PGSQL.User,
			Database: cfg.PGSQL.Database,
			Password: cfg.PGSQL.Password,
		},
	}
}
