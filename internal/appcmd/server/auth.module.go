package server

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/lwmacct/260630-go-hsr-auth/pkg/auth"
	"github.com/lwmacct/260630-go-hsr-oauth/pkg/oauth"
	"github.com/lwmacct/260630-go-hsr-shared/pkg/appmodule"
	"github.com/lwmacct/260630-go-hsr-shared/pkg/challenge"
	"github.com/uptrace/bun"

	"github.com/lwmacct/260630-go-hsr-app/internal/config"
)

type AuthModule struct {
	cfg   *config.Config
	value *auth.Module
}

var _ appmodule.Module = (*AuthModule)(nil)
var _ appmodule.SchemaApplier = (*AuthModule)(nil)
var _ oauth.Identity = (*AuthModule)(nil)

func NewAuthSpec(cfg *config.Config) appmodule.Spec {
	module := &AuthModule{cfg: cfg}
	return appmodule.Spec{
		Name:        module.Name(),
		ApplySchema: module.ApplySchema,
		Build: func(ctx *appmodule.Context) (appmodule.Module, error) {
			module := &AuthModule{cfg: cfg}
			authModule, err := auth.New(auth.Options{
				DB:         ctx.DB(),
				Config:     module.config(),
				SessionTTL: cfg.Server.Auth.Session.TTL,
			})
			if err != nil {
				return nil, err
			}
			module.value = authModule
			return module, nil
		},
	}
}

func (m *AuthModule) Name() string {
	return "auth"
}

func (m *AuthModule) ApplySchema(ctx context.Context, db *bun.DB) error {
	return auth.ApplySchema(ctx, db)
}

func (m *AuthModule) Register(api huma.API) {
	m.value.Register(api)
}

func (m *AuthModule) UserByID(ctx context.Context, id int64) (*auth.User, error) {
	return m.value.UserByID(ctx, id)
}

func (m *AuthModule) CreateExternalUser(ctx context.Context, input auth.ExternalUserInput) (*auth.User, error) {
	return m.value.CreateExternalUser(ctx, input)
}

func (m *AuthModule) CreateSession(ctx context.Context, userID int64, request auth.SessionRequest) (*auth.Session, error) {
	return m.value.CreateSession(ctx, userID, request)
}

func (m *AuthModule) RequireAdmin(ctx context.Context, sessionID string, request auth.SessionRequest) (*auth.User, error) {
	return m.value.RequireAdmin(ctx, sessionID, request)
}

func (m *AuthModule) config() auth.Config {
	return auth.Config{
		Local: auth.LocalConfig{
			LoginEnabled:        m.cfg.Server.Auth.Local.LoginEnabled,
			RegistrationEnabled: m.cfg.Server.Auth.Local.RegistrationEnabled,
		},
		Session: auth.SessionConfig{
			Cookie: auth.SessionCookieConfig{
				Name:   m.cfg.Server.Auth.Session.Cookie.Name,
				Path:   m.cfg.Server.Auth.Session.Cookie.Path,
				Secure: m.cfg.Server.Auth.Session.Cookie.Secure,
			},
		},
		RuntimeAdmins:     m.cfg.Server.Auth.Admins,
		Request:           auth.RequestFromContext,
		ChallengeProvider: m.challengeProvider(),
	}
}

func (m *AuthModule) challengeProvider() challenge.Provider {
	cfg := m.cfg.Server.Auth.Challenge
	switch cfg.Provider {
	case challenge.ProviderHCaptcha:
		provider, err := challenge.NewRemoteTokenProvider(
			challenge.ProviderHCaptcha,
			cfg.HCaptcha.SiteKey,
			cfg.HCaptcha.Secret,
			cfg.HCaptcha.VerifyURL,
		)
		if err == nil {
			return provider
		}
	case challenge.ProviderTurnstile:
		provider, err := challenge.NewRemoteTokenProvider(
			challenge.ProviderTurnstile,
			cfg.Turnstile.SiteKey,
			cfg.Turnstile.Secret,
			cfg.Turnstile.VerifyURL,
		)
		if err == nil {
			return provider
		}
	}
	return challenge.NewImageProvider(cfg.Image.MaxChallenges)
}
