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
var _ oauth.Identity = (*AuthModule)(nil)

func NewAuthModule(cfg *config.Config) *AuthModule {
	return &AuthModule{cfg: cfg}
}

func (m *AuthModule) Name() string {
	return "auth"
}

func (m *AuthModule) ApplySchema(ctx context.Context, db *bun.DB) error {
	return auth.ApplySchema(ctx, db)
}

func (m *AuthModule) Init(ctx context.Context, db *bun.DB) error {
	module, err := auth.New(auth.Options{
		DB:         db,
		Config:     m.config(),
		SessionTTL: m.cfg.Server.Auth.Session.TTL,
	})
	if err != nil {
		return err
	}
	m.value = module
	return nil
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
		ChallengeProvider: newChallengeProvider(m.cfg.Server.Auth.Challenge),
	}
}

func newChallengeProvider(cfg config.ServerAuthChallenge) challenge.Provider {
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
