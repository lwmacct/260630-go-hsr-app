package server

import (
	"context"
	"errors"

	"github.com/danielgtaylor/huma/v2"
	"github.com/lwmacct/260630-go-hsr-audit/pkg/audit"
	"github.com/lwmacct/260630-go-hsr-auth/pkg/auth"
	"github.com/lwmacct/260630-go-hsr-shared/pkg/appmodule"
	"github.com/uptrace/bun"
)

var errAuditUnauthorized = errors.New("audit unauthorized")

type AuditModule struct {
	auth  *AuthModule
	value *audit.Module
}

var _ appmodule.Module = (*AuditModule)(nil)

func NewAuditModule(authModule *AuthModule) *AuditModule {
	return &AuditModule{auth: authModule}
}

func (m *AuditModule) Name() string {
	return "audit"
}

func (m *AuditModule) ApplySchema(ctx context.Context, db *bun.DB) error {
	return audit.ApplySchema(ctx, db)
}

func (m *AuditModule) Init(ctx context.Context, db *bun.DB) error {
	module, err := audit.New(audit.Options{
		DB:              db,
		AdminAuthorizer: m.authorizer(),
	})
	if err != nil {
		return err
	}
	m.value = module
	return nil
}

func (m *AuditModule) Register(api huma.API) {
	m.value.Register(api)
}

func (m *AuditModule) authorizer() audit.AdminAuthorizer {
	return audit.AdminAuthorizerFunc(func(ctx context.Context, sessionID string) (*audit.Principal, error) {
		request, ok := auth.RequestFromContext(ctx)
		if !ok {
			return nil, errAuditUnauthorized
		}
		user, err := m.auth.RequireAdmin(ctx, sessionID, request)
		if err != nil {
			return nil, errAuditUnauthorized
		}
		return &audit.Principal{
			UserID:   user.ID,
			Username: user.Username,
			Role:     user.Role,
			Admin:    user.Admin,
		}, nil
	})
}
