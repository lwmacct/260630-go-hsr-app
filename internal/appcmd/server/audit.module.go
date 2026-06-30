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
var _ appmodule.SchemaApplier = (*AuditModule)(nil)

func NewAuditSpec() appmodule.Spec {
	module := &AuditModule{}
	return appmodule.Spec{
		Name:        module.Name(),
		Requires:    []string{"auth"},
		ApplySchema: module.ApplySchema,
		Build: func(ctx *appmodule.Context) (appmodule.Module, error) {
			return newAuditModule(ctx.Context(), ctx.DB(), appmodule.MustContextGet[*AuthModule](ctx, "auth"))
		},
	}
}

func newAuditModule(ctx context.Context, db *bun.DB, authModule *AuthModule) (*AuditModule, error) {
	module := &AuditModule{auth: authModule}
	auditModule, err := audit.New(audit.Options{
		DB:              db,
		AdminAuthorizer: module.authorizer(),
	})
	if err != nil {
		return nil, err
	}
	module.value = auditModule
	return module, nil
}

func (m *AuditModule) Name() string {
	return "audit"
}

func (m *AuditModule) ApplySchema(ctx context.Context, db *bun.DB) error {
	return audit.ApplySchema(ctx, db)
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
