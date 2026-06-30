package server

import (
	"github.com/lwmacct/260630-go-hsr-auth/pkg/auth"
	"github.com/lwmacct/260630-go-hsr-shared/pkg/challenge"

	"github.com/lwmacct/260630-go-hsr-app/internal/config"
)

func newAuthConfig(cfg *config.Config) auth.Config {
	return auth.Config{
		Local: auth.LocalConfig{
			LoginEnabled:        cfg.Server.Auth.Local.LoginEnabled,
			RegistrationEnabled: cfg.Server.Auth.Local.RegistrationEnabled,
		},
		Session: auth.SessionConfig{
			Cookie: auth.SessionCookieConfig{
				Name:   cfg.Server.Auth.Session.Cookie.Name,
				Path:   cfg.Server.Auth.Session.Cookie.Path,
				Secure: cfg.Server.Auth.Session.Cookie.Secure,
			},
		},
		RuntimeAdmins:     cfg.Server.Auth.Admins,
		Request:           auth.RequestFromContext,
		ChallengeProvider: newChallengeProvider(cfg.Server.Auth.Challenge),
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
