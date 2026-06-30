package server

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/lwmacct/260630-go-hsr-app/internal/config"
)

func TestFinalHTTPHandlerOAuthCallbackCreatesSession(t *testing.T) {
	provider := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/token":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"access_token":"test-token"}`))
		case "/user":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"id":42,"login":"octo","name":"Octo Cat","email":"octo@example.test","avatar_url":"https://example.test/avatar.png"}`))
		default:
			http.NotFound(w, r)
		}
	}))
	t.Cleanup(provider.Close)

	cfg := config.DefaultConfig()
	cfg.Server.Database.SQLite = "file:" + strings.NewReplacer("/", "-", " ", "-").Replace(t.Name()) + "?mode=memory&cache=shared"
	cfg.Server.HTTP.WebRoot = ""
	cfg.Server.Auth.OAuth.Enabled = true
	cfg.Server.Auth.OAuth.AutoRegister = true
	cfg.Server.Auth.OAuth.GitHub.Enabled = true
	cfg.Server.Auth.OAuth.GitHub.ClientID = "client-id"
	cfg.Server.Auth.OAuth.GitHub.ClientSecret = "client-secret"
	cfg.Server.Auth.OAuth.GitHub.AuthURL = provider.URL + "/authorize"
	cfg.Server.Auth.OAuth.GitHub.TokenURL = provider.URL + "/token"
	cfg.Server.Auth.OAuth.GitHub.UserInfoURL = provider.URL + "/user"

	deps, err := newDependenciesWithoutTLS(context.Background(), &cfg)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(deps.Close)
	handler := newHTTPHandler(&cfg, deps)

	start := httptest.NewRecorder()
	handler.ServeHTTP(start, httptest.NewRequest(http.MethodGet, "/api/auth/oauth/start?provider=github&returnTo=%2F%23%2Fconsole", nil))
	if start.Code != http.StatusFound {
		t.Fatalf("start status = %d, body = %s", start.Code, start.Body.String())
	}
	state := mustURLQueryValue(t, start.Header().Get("Location"), "state")

	callback := httptest.NewRecorder()
	callbackURL := "/api/auth/oauth/callback?provider=github&code=ok&state=" + url.QueryEscape(state)
	handler.ServeHTTP(callback, httptest.NewRequest(http.MethodGet, callbackURL, nil))
	if callback.Code != http.StatusFound {
		t.Fatalf("callback status = %d, body = %s", callback.Code, callback.Body.String())
	}
	if callback.Header().Get("Location") != "/#/console" {
		t.Fatalf("unexpected callback location: %s", callback.Header().Get("Location"))
	}
	cookies := callback.Result().Cookies()
	if len(cookies) == 0 {
		t.Fatalf("missing session cookie, headers = %#v", callback.Header())
	}

	me := httptest.NewRecorder()
	meReq := httptest.NewRequest(http.MethodGet, "/api/auth/me", nil)
	meReq.AddCookie(cookies[0])
	handler.ServeHTTP(me, meReq)
	if me.Code != http.StatusOK {
		t.Fatalf("me status = %d, body = %s", me.Code, me.Body.String())
	}

	var session finalAuthSessionBody
	if err := json.Unmarshal(me.Body.Bytes(), &session); err != nil {
		t.Fatal(err)
	}
	if !session.Authenticated || session.User == nil || session.User.Username != "octo" {
		t.Fatalf("unexpected session body: %#v", session)
	}
}

func mustURLQueryValue(t *testing.T, rawURL string, key string) string {
	t.Helper()

	parsed, err := url.Parse(rawURL)
	if err != nil {
		t.Fatal(err)
	}
	value := parsed.Query().Get(key)
	if value == "" {
		t.Fatalf("missing %q in %s", key, rawURL)
	}
	return value
}

type finalAuthSessionBody struct {
	Authenticated bool               `json:"authenticated"`
	User          *finalAuthUserBody `json:"user"`
}

type finalAuthUserBody struct {
	Username string `json:"username"`
}
