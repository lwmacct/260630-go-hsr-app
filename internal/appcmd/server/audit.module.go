package server

import (
	"context"
	"errors"

	"github.com/lwmacct/260630-go-hsr-audit/pkg/audit"
	"github.com/lwmacct/260630-go-hsr-auth/pkg/auth"
)

var errAuditUnauthorized = errors.New("audit unauthorized")

func newAuditAuthorizer(module *auth.Module) audit.AdminAuthorizer {
	return audit.AdminAuthorizerFunc(func(ctx context.Context, sessionID string) (*audit.Principal, error) {
		request, ok := auth.RequestFromContext(ctx)
		if !ok {
			return nil, errAuditUnauthorized
		}
		user, err := module.RequireAdmin(ctx, sessionID, request)
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
