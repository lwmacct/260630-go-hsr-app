package server

import (
	"errors"
	"strings"

	"github.com/lwmacct/260630-go-hsr-auth/pkg/auth"
	"github.com/lwmacct/260630-go-hsr-oauth/pkg/oauth"

	"github.com/lwmacct/260630-go-hsr-app/internal/config"
)

func newOAuthConfig(cfg *config.Config, identity oauth.Identity) oauth.Config {
	return oauth.Config{
		Enabled:         cfg.Server.Auth.OAuth.Enabled,
		AutoRegister:    cfg.Server.Auth.OAuth.AutoRegister,
		CallbackBaseURL: cfg.Server.Auth.OAuth.CallbackBaseURL,
		Providers:       enabledOAuthProviders(cfg),
		Request:         auth.RequestFromContext,
		Identity:        identity,
		Provider:        func(provider string) (oauth.Provider, error) { return oauthProvider(cfg, provider) },
	}
}

func enabledOAuthProviders(cfg *config.Config) []oauth.ProviderConfig {
	if !cfg.Server.Auth.OAuth.Enabled {
		return nil
	}
	providers := make([]oauth.ProviderConfig, 0, 2)
	if oauthProviderEnabled(cfg.Server.Auth.OAuth.GitHub) {
		providers = append(providers, oauth.ProviderConfig{Provider: oauth.ProviderGitHub, Label: "GitHub"})
	}
	if oauthProviderEnabled(cfg.Server.Auth.OAuth.Google) {
		providers = append(providers, oauth.ProviderConfig{Provider: oauth.ProviderGoogle, Label: "Google"})
	}
	return providers
}

func oauthProviderEnabled(cfg config.ServerAuthOAuthProvider) bool {
	return cfg.Enabled && cfg.ClientID != "" && cfg.ClientSecret != "" && cfg.AuthURL != "" && cfg.TokenURL != "" && cfg.UserInfoURL != ""
}

func oauthProvider(cfg *config.Config, provider string) (oauth.Provider, error) {
	if !cfg.Server.Auth.OAuth.Enabled {
		return nil, errors.New("oauth disabled")
	}
	switch strings.ToLower(strings.TrimSpace(provider)) {
	case oauth.ProviderGitHub:
		return oauth.NewProvider(oauth.ProviderGitHub, oauthClientConfig(cfg.Server.Auth.OAuth.GitHub))
	case oauth.ProviderGoogle:
		return oauth.NewProvider(oauth.ProviderGoogle, oauthClientConfig(cfg.Server.Auth.OAuth.Google))
	default:
		return nil, errors.New("unsupported provider")
	}
}

func oauthClientConfig(cfg config.ServerAuthOAuthProvider) oauth.ClientConfig {
	return oauth.ClientConfig{
		Enabled:      cfg.Enabled,
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		Scopes:       cfg.Scopes,
		AuthURL:      cfg.AuthURL,
		TokenURL:     cfg.TokenURL,
		UserInfoURL:  cfg.UserInfoURL,
	}
}
