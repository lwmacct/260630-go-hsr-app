package server

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"

	"github.com/lwmacct/260630-go-hsr-audit/pkg/audit"
	"github.com/lwmacct/260630-go-hsr-auth/pkg/auth"
)

var errAuditUnauthorized = errors.New("audit unauthorized")

func newAuditAuthorizer(module *auth.Module) audit.AdminAuthorizer {
	authHandler := module.Handler()
	return audit.AdminAuthorizerFunc(func(ctx context.Context, sessionID string) (*audit.Principal, error) {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, "/auth/me", nil)
		if err != nil {
			return nil, err
		}
		req.AddCookie(&http.Cookie{Name: "web_session", Value: sessionID})

		rr := httptest.NewRecorder()
		authHandler.ServeHTTP(rr, req)
		if rr.Code != http.StatusOK {
			return nil, errAuditUnauthorized
		}

		var body authSessionBody
		if err := json.Unmarshal(rr.Body.Bytes(), &body); err != nil {
			return nil, err
		}
		if !body.Authenticated || body.User == nil {
			return nil, errAuditUnauthorized
		}
		return &audit.Principal{
			UserID:   body.User.ID,
			Username: body.User.Username,
			Role:     body.User.Role,
			Admin:    body.User.Admin,
		}, nil
	})
}

type authSessionBody struct {
	Authenticated bool          `json:"authenticated"`
	User          *authUserBody `json:"user"`
}

type authUserBody struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Admin    bool   `json:"admin"`
}
