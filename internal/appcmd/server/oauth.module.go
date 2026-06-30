package server

import (
	"context"
	"errors"
	"strings"

	"github.com/danielgtaylor/huma/v2"
	"github.com/lwmacct/260630-go-hsr-auth/pkg/auth"
	"github.com/lwmacct/260630-go-hsr-oauth/pkg/oauth"
	"github.com/lwmacct/260630-go-hsr-shared/pkg/appmodule"
	"github.com/uptrace/bun"

	"github.com/lwmacct/260630-go-hsr-app/internal/config"
)

type OauthModule struct {
	cfg      *config.Config
	identity oauth.Identity
	value    *oauth.Module
}

var _ appmodule.Module = (*OauthModule)(nil)
var _ appmodule.SchemaApplier = (*OauthModule)(nil)

func NewOauthSpec(cfg *config.Config) appmodule.Spec {
	module := &OauthModule{cfg: cfg}
	return appmodule.Spec{
		Name:        module.Name(),
		Requires:    []string{"auth"},
		ApplySchema: module.ApplySchema,
		Build: func(ctx *appmodule.Context) (appmodule.Module, error) {
			module := &OauthModule{
				cfg:      cfg,
				identity: appmodule.MustContextGet[*AuthModule](ctx, "auth"),
			}
			oauthModule, err := oauth.New(oauth.Options{
				DB:     ctx.DB(),
				Config: module.config(),
			})
			if err != nil {
				return nil, err
			}
			module.value = oauthModule
			return module, nil
		},
	}
}

func (m *OauthModule) Name() string {
	return "oauth"
}

func (m *OauthModule) ApplySchema(ctx context.Context, db *bun.DB) error {
	return oauth.ApplySchema(ctx, db)
}

func (m *OauthModule) Register(api huma.API) {
	m.value.Register(api)
}

func (m *OauthModule) config() oauth.Config {
	return oauth.Config{
		Enabled:         m.cfg.Server.Auth.OAuth.Enabled,
		AutoRegister:    m.cfg.Server.Auth.OAuth.AutoRegister,
		CallbackBaseURL: m.cfg.Server.Auth.OAuth.CallbackBaseURL,
		Providers:       m.enabledProviders(),
		Request:         auth.RequestFromContext,
		Identity:        m.identity,
		Provider:        func(provider string) (oauth.Provider, error) { return m.provider(provider) },
	}
}

func (m *OauthModule) enabledProviders() []oauth.ProviderConfig {
	if !m.cfg.Server.Auth.OAuth.Enabled {
		return nil
	}
	providers := make([]oauth.ProviderConfig, 0, 2)
	if m.providerEnabled(m.cfg.Server.Auth.OAuth.GitHub) {
		providers = append(providers, oauth.ProviderConfig{Provider: oauth.ProviderGitHub, Label: "GitHub"})
	}
	if m.providerEnabled(m.cfg.Server.Auth.OAuth.Google) {
		providers = append(providers, oauth.ProviderConfig{Provider: oauth.ProviderGoogle, Label: "Google"})
	}
	return providers
}

func (m *OauthModule) providerEnabled(cfg config.ServerAuthOAuthProvider) bool {
	return cfg.Enabled && cfg.ClientID != "" && cfg.ClientSecret != "" && cfg.AuthURL != "" && cfg.TokenURL != "" && cfg.UserInfoURL != ""
}

func (m *OauthModule) provider(provider string) (oauth.Provider, error) {
	if !m.cfg.Server.Auth.OAuth.Enabled {
		return nil, errors.New("oauth disabled")
	}
	switch strings.ToLower(strings.TrimSpace(provider)) {
	case oauth.ProviderGitHub:
		return oauth.NewProvider(oauth.ProviderGitHub, m.clientConfig(m.cfg.Server.Auth.OAuth.GitHub))
	case oauth.ProviderGoogle:
		return oauth.NewProvider(oauth.ProviderGoogle, m.clientConfig(m.cfg.Server.Auth.OAuth.Google))
	default:
		return nil, errors.New("unsupported provider")
	}
}

func (m *OauthModule) clientConfig(cfg config.ServerAuthOAuthProvider) oauth.ClientConfig {
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
