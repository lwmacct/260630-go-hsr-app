package server

import (
	"errors"
	"strings"

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
		OAuth: auth.OAuthConfig{
			Enabled:         cfg.Server.Auth.OAuth.Enabled,
			AutoRegister:    cfg.Server.Auth.OAuth.AutoRegister,
			CallbackBaseURL: cfg.Server.Auth.OAuth.CallbackBaseURL,
			Providers:       enabledOAuthProviders(cfg),
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
		OAuthProvider:     func(provider string) (auth.OAuthProvider, error) { return oauthProvider(cfg, provider) },
		ChallengeProvider: newChallengeProvider(cfg.Server.Auth.Challenge),
	}
}

func enabledOAuthProviders(cfg *config.Config) []auth.OAuthProviderConfig {
	if !cfg.Server.Auth.OAuth.Enabled {
		return nil
	}
	providers := make([]auth.OAuthProviderConfig, 0, 2)
	if oauthProviderEnabled(cfg.Server.Auth.OAuth.GitHub) {
		providers = append(providers, auth.OAuthProviderConfig{Provider: auth.OAuthProviderGitHub, Label: "GitHub"})
	}
	if oauthProviderEnabled(cfg.Server.Auth.OAuth.Google) {
		providers = append(providers, auth.OAuthProviderConfig{Provider: auth.OAuthProviderGoogle, Label: "Google"})
	}
	return providers
}

func oauthProviderEnabled(cfg config.ServerAuthOAuthProvider) bool {
	return cfg.Enabled && cfg.ClientID != "" && cfg.ClientSecret != "" && cfg.AuthURL != "" && cfg.TokenURL != "" && cfg.UserInfoURL != ""
}

func oauthProvider(cfg *config.Config, provider string) (auth.OAuthProvider, error) {
	if !cfg.Server.Auth.OAuth.Enabled {
		return nil, errors.New("oauth disabled")
	}
	switch strings.ToLower(strings.TrimSpace(provider)) {
	case auth.OAuthProviderGitHub:
		return auth.NewOAuthProvider(auth.OAuthProviderGitHub, oauthClientConfig(cfg.Server.Auth.OAuth.GitHub))
	case auth.OAuthProviderGoogle:
		return auth.NewOAuthProvider(auth.OAuthProviderGoogle, oauthClientConfig(cfg.Server.Auth.OAuth.Google))
	default:
		return nil, errors.New("unsupported provider")
	}
}

func oauthClientConfig(cfg config.ServerAuthOAuthProvider) auth.OAuthClientConfig {
	return auth.OAuthClientConfig{
		Enabled:      cfg.Enabled,
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		Scopes:       cfg.Scopes,
		AuthURL:      cfg.AuthURL,
		TokenURL:     cfg.TokenURL,
		UserInfoURL:  cfg.UserInfoURL,
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
