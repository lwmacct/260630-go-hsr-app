package server

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/lwmacct/260630-go-hsr-app/internal/config"
	"github.com/lwmacct/260630-go-hsr-auth/pkg/auth"
	"github.com/uptrace/bun"
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

func TestAuditAuthorizerRejectsMissingSession(t *testing.T) {
	deps := mustTestDependencies(t)
	authorizer := deps.audit.authorizer()

	_, err := authorizer.RequireAdmin(authContext(), "")
	if err == nil {
		t.Fatal("expected missing session to be rejected")
	}
}

func TestAuditAuthorizerRejectsRegularUser(t *testing.T) {
	deps := mustTestDependencies(t)
	authorizer := deps.audit.authorizer()
	sessionID := createTestSession(t, deps, "regular-user", auth.UserRoleUser)

	_, err := authorizer.RequireAdmin(authContext(), sessionID)
	if err == nil {
		t.Fatal("expected regular user to be rejected")
	}
}

func TestAuditAuthorizerAllowsRoleAdmin(t *testing.T) {
	deps := mustTestDependencies(t)
	authorizer := deps.audit.authorizer()
	sessionID := createTestSession(t, deps, "role-admin", auth.UserRoleAdmin)

	principal, err := authorizer.RequireAdmin(authContext(), sessionID)
	if err != nil {
		t.Fatal(err)
	}
	if principal.Username != "role-admin" || !principal.Admin {
		t.Fatalf("unexpected principal: %#v", principal)
	}
}

func TestAuditAuthorizerAllowsRuntimeAdmin(t *testing.T) {
	deps := mustTestDependencies(t, func(cfg *config.Config) {
		cfg.Server.Auth.Admins = []string{"runtime-admin"}
	})
	authorizer := deps.audit.authorizer()
	sessionID := createTestSession(t, deps, "runtime-admin", auth.UserRoleUser)

	principal, err := authorizer.RequireAdmin(authContext(), sessionID)
	if err != nil {
		t.Fatal(err)
	}
	if principal.Username != "runtime-admin" || !principal.Admin {
		t.Fatalf("unexpected principal: %#v", principal)
	}
}

func mustTestDependencies(t *testing.T, edits ...func(*config.Config)) *dependencies {
	t.Helper()

	cfg := config.DefaultConfig()
	cfg.Server.Database.SQLite = "file:" + strings.NewReplacer("/", "-", " ", "-").Replace(t.Name()) + "?mode=memory&cache=shared"
	cfg.Server.HTTP.WebRoot = ""
	for _, edit := range edits {
		edit(&cfg)
	}
	deps, err := newDependenciesWithoutTLS(context.Background(), &cfg)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(deps.Close)
	return deps
}

func createTestSession(t *testing.T, deps *dependencies, username string, role string) string {
	t.Helper()

	userID := createTestUser(t, deps, username, role)
	session, err := deps.auth.CreateSession(authContext(), userID, authRequest())
	if err != nil {
		t.Fatal(err)
	}
	return session.ID
}

func createTestUser(t *testing.T, deps *dependencies, username string, role string) int64 {
	t.Helper()

	now := time.Now().UTC()
	user := authUserRow{
		Username:    username,
		DisplayName: username,
		Role:        role,
		Status:      auth.UserStatusActive,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	if _, err := deps.db.NewInsert().Model(&user).Exec(context.Background()); err != nil {
		t.Fatal(err)
	}
	return user.ID
}

func authContext() context.Context {
	return auth.ContextWithRequest(context.Background(), authRequest())
}

func authRequest() auth.SessionRequest {
	return auth.SessionRequest{
		IP:         "127.0.0.1",
		Scheme:     "http",
		Host:       "example.test",
		UserAgent:  "test",
		Method:     "GET",
		Path:       "/api/admin/audit/events",
		RemoteAddr: "127.0.0.1:12345",
	}
}

type authUserRow struct {
	bun.BaseModel `bun:"table:users"`

	ID          int64     `bun:"id,pk,autoincrement"`
	Username    string    `bun:"username,notnull,unique"`
	DisplayName string    `bun:"display_name,notnull"`
	Role        string    `bun:"role,notnull"`
	Status      string    `bun:"status,notnull"`
	CreatedAt   time.Time `bun:"created_at,notnull"`
	UpdatedAt   time.Time `bun:"updated_at,notnull"`
}
